import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// ============================================================
// PostgreSQL Pool
// ============================================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("error", (err) => {
  console.error("DB pool error:", err.message);
});

const query = <T = Record<string, unknown>>(
  text: string,
  params?: (string | number | boolean | null)[]
) => pool.query<T>(text, params);

// ============================================================
// Async error wrapper
// ============================================================
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

// ============================================================
// MIDDLEWARE — n8n Secret যাচাই
// ============================================================
function verifyN8NSecret(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers["x-n8n-secret"] || req.body?.secret;
  const expected = process.env.N8N_SECRET;

  if (expected && secret !== expected) {
    res.status(401).json({ error: "Unauthorized: invalid secret" });
    return;
  }
  next();
}

// ============================================================
// ROUTE 1: n8n → Postatu
// n8n থেকে video data পাঠাবে, এখানে receive করে job_queue তে save হবে
// ============================================================
app.post(
  "/api/ingest",
  verifyN8NSecret,
  asyncHandler(async (req, res) => {
    const {
      userId,
      video_url,
      title       = "",
      description = "",
      hashtags    = [],
      platforms   = [],
    } = req.body;

    // Validation
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }
    if (!video_url) {
      res.status(400).json({ error: "video_url is required" });
      return;
    }
    if (!Array.isArray(platforms) || platforms.length === 0) {
      res.status(400).json({ error: "platforms array is required" });
      return;
    }

    // job_queue তে insert করো
    const { rows } = await query<{ id: string }>(
      `INSERT INTO job_queue
         (user_id, video_url, title, description, hashtags, platforms, status, source)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'n8n')
       RETURNING id`,
      [
        userId,
        video_url,
        title,
        description,
        hashtags,
        platforms,
      ]
    );

    const jobId = rows[0].id;

    // n8n-কে সাথে সাথে response দাও (wait করাবে না)
    res.status(202).json({
      message: "Job queued successfully",
      jobId,
      status: "pending",
    });

    // Background এ process করো
    processJob(jobId, userId, video_url, title, description, hashtags, platforms)
      .catch((err) => console.error(`Job ${jobId} failed:`, err));
  })
);

// ============================================================
// ROUTE 2: Dashboard/Publish page → Postatu (Manual Broadcast)
// ইউজার নিজে Publish page থেকে পাঠালে এখানে আসবে
// ============================================================
app.post(
  "/api/broadcast",
  asyncHandler(async (req, res) => {
    const { userId, accountIds, content } = req.body;

    if (!userId || !accountIds?.length || !content?.mediaUrl) {
      res.status(400).json({ error: "userId, accountIds, and content.mediaUrl are required" });
      return;
    }

    // accountIds থেকে platform names বের করো
    const placeholders = accountIds.map((_: string, i: number) => `$${i + 1}`).join(",");
    const { rows: accountRows } = await query<{ platform: string }>(
      `SELECT DISTINCT platform FROM social_accounts WHERE id IN (${placeholders})`,
      accountIds
    );
    const platforms = accountRows.map((r) => r.platform);

    // Job queue তে insert করো
    const { rows } = await query<{ id: string }>(
      `INSERT INTO job_queue
         (user_id, video_url, title, description, hashtags, platforms, status, source)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'manual')
       RETURNING id`,
      [
        userId,
        content.mediaUrl,
        content.title       ?? "",
        content.description ?? "",
        content.hashtags    ?? [],
        platforms,
      ]
    );

    const jobId = rows[0].id;

    res.status(202).json({
      message: "Broadcast queued",
      jobId,
      status: "pending",
    });

    // Background process
    processJob(
      jobId,
      userId,
      content.mediaUrl,
      content.title       ?? "",
      content.description ?? "",
      content.hashtags    ?? [],
      platforms
    ).catch((err) => console.error(`Broadcast job ${jobId} failed:`, err));
  })
);

// ============================================================
// ROUTE 3: Job status check
// Frontend থেকে job এর অবস্থা জানতে
// ============================================================
app.get(
  "/api/jobs/:jobId",
  asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const { rows } = await query(
      `SELECT id, status, result, retry_count, created_at, updated_at
       FROM job_queue WHERE id = $1`,
      [jobId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    res.json(rows[0]);
  })
);

// ============================================================
// ROUTE 4: User এর সব jobs
// ============================================================
app.get(
  "/api/jobs/user/:userId",
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const limit = Number(req.query.limit) || 20;

    const { rows } = await query(
      `SELECT id, video_url, title, platforms, status, result, source, created_at
       FROM job_queue
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json(rows);
  })
);

// ============================================================
// BACKGROUND JOB PROCESSOR
// প্রতিটি platform এ publish করার মূল logic
// ============================================================
async function processJob(
  jobId:       string,
  userId:      string,
  videoUrl:    string,
  title:       string,
  description: string,
  hashtags:    string[],
  platforms:   string[]
) {
  // Status: processing
  await query(
    `UPDATE job_queue SET status = 'processing', updated_at = NOW() WHERE id = $1`,
    [jobId]
  );

  const results: Record<string, string> = {};

  for (const platform of platforms) {
    try {
      // DB থেকে ওই platform এর access token নাও
      const { rows } = await query<{ access_token: string }>(
        `SELECT access_token
         FROM social_accounts
         WHERE user_id = $1 AND platform = $2
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId, platform]
      );

      if (!rows[0]) {
        results[platform] = "no_account_connected";
        continue;
      }

      const accessToken = rows[0].access_token;

      // Platform অনুযায়ী publish করো
      switch (platform) {
        case "youtube":
          await publishToYouTube(accessToken, videoUrl, title, description, hashtags);
          break;
        case "facebook":
          await publishToFacebook(accessToken, videoUrl, title, description);
          break;
        case "instagram":
          await publishToInstagram(accessToken, videoUrl, title);
          break;
        case "tiktok":
          await publishToTikTok(accessToken, videoUrl, title);
          break;
        default:
          results[platform] = "unsupported_platform";
          continue;
      }

      results[platform] = "success";

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "unknown_error";
      console.error(`[Job ${jobId}] ${platform} failed:`, msg);
      results[platform] = `failed: ${msg}`;
    }
  }

  // সব platform এর result দেখে final status ঠিক করো
  const values       = Object.values(results);
  const allSuccess   = values.every((v) => v === "success");
  const allFailed    = values.every((v) => v !== "success");
  const finalStatus  = allSuccess ? "done" : allFailed ? "failed" : "partial";

  await query(
    `UPDATE job_queue
     SET status = $1, result = $2, updated_at = NOW()
     WHERE id = $3`,
    [finalStatus, JSON.stringify(results), jobId]
  );

  console.log(`[Job ${jobId}] Completed — status: ${finalStatus}`, results);
}

// ============================================================
// PLATFORM PUBLISHERS
// প্রতিটি platform এর API call এখানে
// ============================================================

async function publishToYouTube(
  accessToken: string,
  videoUrl:    string,
  title:       string,
  description: string,
  hashtags:    string[]
) {
  const { default: axios } = await import("axios");

  // Step 1: YouTube resumable upload শুরু করো
  const initResponse = await axios.post(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      snippet: {
        title:       title || "Untitled",
        description: description,
        tags:        hashtags,
        categoryId:  "22", // People & Blogs
      },
      status: {
        privacyStatus: "public",
      },
    },
    {
      headers: {
        Authorization:   `Bearer ${accessToken}`,
        "Content-Type":  "application/json",
        "X-Upload-Type": "resumable",
      },
    }
  );

  const uploadUrl = initResponse.headers.location;

  // Step 2: Video URL থেকে stream করে upload করো
  const videoStream = await axios.get(videoUrl, { responseType: "stream" });

  await axios.put(uploadUrl, videoStream.data, {
    headers: {
      "Content-Type": "video/*",
    },
  });
}

async function publishToFacebook(
  accessToken: string,
  videoUrl:    string,
  title:       string,
  description: string
) {
  const { default: axios } = await import("axios");

  // Facebook Reels / Video upload
  await axios.post(
    `https://graph.facebook.com/v19.0/me/videos`,
    {
      file_url:    videoUrl,
      title:       title,
      description: description,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

async function publishToInstagram(
  accessToken: string,
  videoUrl:    string,
  caption:     string
) {
  const { default: axios } = await import("axios");

  // Step 1: Media container তৈরি করো
  const containerRes = await axios.post(
    `https://graph.facebook.com/v19.0/me/media`,
    {
      media_type:    "REELS",
      video_url:     videoUrl,
      caption:       caption,
      share_to_feed: true,
    },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const creationId = containerRes.data.id;

  // Step 2: Publish করো
  await axios.post(
    `https://graph.facebook.com/v19.0/me/media_publish`,
    { creation_id: creationId },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
}

async function publishToTikTok(
  accessToken: string,
  videoUrl:    string,
  title:       string
) {
  const { default: axios } = await import("axios");

  // TikTok Content Posting API v2
  await axios.post(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      post_info: {
        title:         title,
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_duet:  false,
        disable_stitch: false,
        disable_comment: false,
      },
      source_info: {
        source:    "PULL_FROM_URL",
        video_url: videoUrl,
      },
    },
    {
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  );
}

// ============================================================
// CENTRAL ERROR HANDLER
// ============================================================
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ============================================================
// SERVER START
// ============================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // SPA fallback — React Router এর জন্য
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, () =>
    console.log(`✅ Postatu server running on port ${PORT}`)
  );

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
      await pool.end();
      console.log("DB pool closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
}

startServer();
