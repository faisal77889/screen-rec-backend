const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

async function transcribeWithWhisper(audioPath, outputDir) {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(outputDir, path.basename(audioPath, path.extname(audioPath)));

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const cmd = `whisper "${audioPath}" --language en --output_format srt --output_dir "${outputDir}"`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error("Whisper error:", stderr || stdout);
                return reject("Failed to transcribe audio");
            }

            const srtPath = `${outputPath}.srt`;
            if (!fs.existsSync(srtPath)) {
                return reject("SRT file not created");
            }

            resolve(srtPath);
        });
    });
}

module.exports = { transcribeWithWhisper };
