const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

function extractAudioFromVideo(videoPath, outputDir) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const audioPath = path.join(outputDir, `${Date.now()}-audio.wav`);

    ffmpeg(videoPath)
      .output(audioPath)
      .audioCodec('pcm_s16le')
      .format('wav')
      .on('end', () => resolve(audioPath))
      .on('error', reject)
      .run();
  });
}

module.exports = { extractAudioFromVideo };

