import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import

import { router } from "./routes/user.routes.js";
import { playRouter } from "./routes/playlist.routes.js";
import { videoRouter } from "./routes/video.routes.js";
import { tweetRouter } from "./routes/tweet.routes.js";
import { subRouter } from "./routes/subscription.routes.js";
import { commentRouter } from "./routes/comment.routes.js";
import { dashRouter } from "./routes/dashboard.routes.js";
import { likeRouter } from "./routes/like.routes.js";
import { healthRouter } from "./routes/healthCheck.routes.js";

// routes declaration
app.use("/api/v1/users/Account", router);
app.use("/api/v1/users/playlists", playRouter);
app.use("/api/v1/users/videos", videoRouter);
app.use("/api/v1/users/tweets", tweetRouter);
app.use("/api/v1/users/subs", subRouter);
app.use("/api/v1/users/comments", commentRouter);
app.use("/api/v1/users/likes", likeRouter);
app.use("/api/v1/users/dashboard", dashRouter);
app.use("/api/v1/users/health", healthRouter);

export { app };
