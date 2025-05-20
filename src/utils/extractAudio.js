const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");

// Set ffmpeg path for fluent-ffmpeg to use the bundled binary
ffmpeg.setFfmpegPath(ffmpegPath);

function extractAudioFromVideo(videoPath, outputDir) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const audioPath = path.join(outputDir, `${Date.now()}-audio.wav`);

    ffmpeg(videoPath)
      .output(audioPath)
      .audioCodec("pcm_s16le")
      .format("wav")
      .on("end", () => resolve(audioPath))
      .on("error", (err) => {
        console.error("Error extracting audio:", err);
        reject(err);
      })
      .run();
  });
}

module.exports = { extractAudioFromVideo };
