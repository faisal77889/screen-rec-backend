const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config(); // Ensure your OPENAI_API_KEY is in .env

async function transcribeWithWhisper(audioPath, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const audioFile = fs.createReadStream(audioPath);
  const form = new FormData();
  form.append("file", audioFile);
  form.append("model", "whisper-1");
  form.append("response_format", "srt");

  const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  const srtContent = response.data;
  const outputFile = path.join(outputDir, `${path.basename(audioPath, path.extname(audioPath))}.srt`);
  fs.writeFileSync(outputFile, srtContent, "utf-8");

  return outputFile;
}

module.exports = { transcribeWithWhisper };
