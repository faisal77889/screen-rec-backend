const { spawn } = require("child_process");
const path = require("path");
const ffmpegPath = require("ffmpeg-static");

const burnSubtitlesIntoVideo = (videoPath, srtPath, outputDir) => {
    return new Promise((resolve, reject) => {
        const subtitledVideoPath = path.join(outputDir, `subtitled-${path.basename(videoPath)}`);

        // Normalize paths for cross-platform compatibility
        const safeVideoPath = videoPath.replace(/\\/g, "/");
        const safeSrtPath = srtPath.replace(/\\/g, "/");
        const safeOutputPath = subtitledVideoPath.replace(/\\/g, "/");

        // FFmpeg arguments
        const ffmpegArgs = [
            "-i", safeVideoPath,
            "-vf", `subtitles=${safeSrtPath}`,
            "-c:a", "copy",
            safeOutputPath,
            "-y" // Overwrite output if it exists
        ];

        const ffmpeg = spawn(ffmpegPath, ffmpegArgs);

        let stderr = "";

        ffmpeg.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        ffmpeg.on("close", (code) => {
            if (code !== 0) {
                console.error("FFmpeg subtitle burn-in failed:\n", stderr);
                return reject(new Error("Subtitle burn-in failed"));
            }
            resolve(subtitledVideoPath);
        });
    });
};

module.exports = { burnSubtitlesIntoVideo };
