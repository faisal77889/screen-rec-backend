const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const Video = require("../models/video");

const { extractAudioFromVideo } = require('../utils/extractAudio');
const { transcribeWithWhisper } = require("../utils/transcribeWithWhisper");
const { burnSubtitlesIntoVideo } = require("../utils/burnSubtitles");
// Inside your upload route, after extracting audio:

const BASE_URL = "https://loom-backend-production.up.railway.app" || "http://localhost:5000";

const videoRouter = express.Router();

// Middleware to verify JWT
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ error: "Invalid token" });

    req.userId = decoded.userId;
    next();
  });
};

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "uploads", "videos");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Upload video route

videoRouter.post(
  "/upload",
  authenticateUser,
  upload.fields([{ name: "video" }, { name: "thumbnail" }]),
  async (req, res) => {
    try {
      const videoFile = req.files.video[0];
      const videoPath = videoFile.path;

      const audioDir = path.join(__dirname, "..", "uploads", "audios");
      const subtitleDir = path.join(__dirname, "..", "uploads", "subtitles");

      const audioPath = await extractAudioFromVideo(videoPath, audioDir);
      const srtPath = await transcribeWithWhisper(audioPath, subtitleDir);
      const finalVideoPath = await burnSubtitlesIntoVideo(videoPath, srtPath, path.dirname(videoPath));

      const subtitleText = fs.readFileSync(srtPath, "utf8");

      const newVideo = new Video({
        title: req.body.title || "Untitled",
        owner: req.userId,
        videoUrl: finalVideoPath.replace(path.join(__dirname, ".."), "").replace(/\\/g, "/"),
        thumbnailUrl: req.files.thumbnail ? req.files.thumbnail[0].path.replace(path.join(__dirname, ".."), "").replace(/\\/g, "/") : "uploads/videos/placeholder.jpg",
        subtitle: subtitleText
      });

      await newVideo.save();

      const downloadUrl = `${req.protocol}://${req.get("host")}/download/${path.basename(finalVideoPath)}`;

      res.status(201).send({
        message: "Video uploaded with subtitles burned in",
        video: newVideo,
        videoUrl: downloadUrl,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: err.message });
    }
  }
);


// At the bottom of videoRouter.js
videoRouter.get("/download/:filename", (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  console.log("Requested filename:", filename);

  const videoPath = path.join(__dirname, "..", "uploads", "videos", filename);

  if (!fs.existsSync(videoPath)) {
    console.error("Video not found at:", videoPath);
    return res.status(404).send({ error: "Video not found" });
  }

  res.download(videoPath);
});



videoRouter.get("/my-videos", authenticateUser, async (req, res) => {
  try {


    // Find videos uploaded by this user, newest first
    const videos = await Video.find({ owner: req.userId }).sort({ createdAt: -1 });
    console.log(videos);

    // Map videos to include full URLs for frontend
    const formattedVideos = videos.map((video) => ({
      _id: video._id,
      title: video.title,
      createdAt: video.createdAt,
      videoUrl: video.videoUrl.startsWith("http")
        ? video.videoUrl
        : `${BASE_URL}/${video.videoUrl.replace(/^\/+/, "")}`, // remove leading slashes
    }));


    res.json({ videos: formattedVideos });
  } catch (err) {
    console.error("Error fetching user videos:", err);
    res.status(500).json({ error: "Failed to fetch videos." });
  }
});





videoRouter.get("/video/:videoId", authenticateUser, async (req, res) => {
  try {
    const { videoId } = req.params;

    // Fetch video by ID
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ error: "Video not found." });
    }

    const response = {
      _id: video._id,
      title: video.title,
      createdAt: video.createdAt,
      videoUrl: video.videoUrl.startsWith("http")
        ? video.videoUrl
        : `${BASE_URL}/${video.videoUrl}`,
      thumbnailUrl: video.thumbnailUrl
        ? (video.thumbnailUrl.startsWith("http")
          ? video.thumbnailUrl
          : `${BASE_URL}/${video.thumbnailUrl}`)
        : `${BASE_URL}/default-thumbnail.jpg`,
    };

    res.json({ video: response });
  } catch (error) {
    console.error("Error fetching single video:", error);
    res.status(500).json({ error: "Failed to fetch video." });
  }
});






module.exports = videoRouter;
