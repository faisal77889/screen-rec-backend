const { exec } = require("child_process");
const path = require("path");

const burnSubtitlesIntoVideo = (videoPath, srtPath, outputDir) => {
    return new Promise((resolve, reject) => {
        const subtitledVideoPath = path.join(outputDir, `subtitled-${path.basename(videoPath)}`);

        // Convert paths to FFmpeg-safe format (forward slashes, escape colon for Windows)
        const safeVideoPath = videoPath.replace(/\\/g, "/");
        const safeSrtPath = srtPath.replace(/\\/g, "/").replace(/:/g, "\\:");
        const safeOutputPath = subtitledVideoPath.replace(/\\/g, "/");

        // Wrap the srt path inside properly escaped quotes for Windows shell
        const command = `ffmpeg -i "${safeVideoPath}" -vf "subtitles='${safeSrtPath}'" -c:a copy "${safeOutputPath}" -y`;

        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error("FFmpeg subtitle burn-in error:\n", stderr);
                return reject(new Error("Subtitle burn-in failed"));
            }
            resolve(subtitledVideoPath);
        });
    });
};



module.exports = {burnSubtitlesIntoVideo};
