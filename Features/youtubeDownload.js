const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

module.exports = (bot) => {
  bot.onText(/\/download (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1];

    if (ytdl.validateURL(url)) {
      try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, "");

        bot.sendMessage(chatId, 'Pilih format download:\n/mp4 untuk video\n/mp3 untuk audio');
        
        bot.onText(/\/mp4/, () => {
          bot.sendMessage(chatId, 'Downloading your video as MP4...');
          ytdl(url, { quality: 'highestvideo' })
            .pipe(fs.createWriteStream(path.join(__dirname, `${title}.mp4`)))
            .on('finish', () => {
              bot.sendVideo(chatId, path.join(__dirname, `${title}.mp4`))
                .then(() => fs.unlinkSync(path.join(__dirname, `${title}.mp4`))); // Hapus file setelah dikirim
            })
            .on('error', (err) => {
              bot.sendMessage(chatId, 'An error occurred while downloading the video.');
              console.error(err);
            });
        });

        bot.onText(/\/mp3/, () => {
          bot.sendMessage(chatId, 'Downloading your video as MP3...');
          const videoStream = ytdl(url, { quality: 'highestaudio' });
          ffmpeg(videoStream)
            .audioBitrate(128)
            .save(path.join(__dirname, `${title}.mp3`))
            .on('end', () => {
              bot.sendAudio(chatId, path.join(__dirname, `${title}.mp3`))
                .then(() => fs.unlinkSync(path.join(__dirname, `${title}.mp3`))); // Hapus file setelah dikirim
            })
            .on('error', (err) => {
              bot.sendMessage(chatId, 'An error occurred while converting the video.');
              console.error(err);
            });
        });
      } catch (error) {
        console.error('Error getting video info:', error);
        bot.sendMessage(chatId, 'Terjadi kesalahan saat mendapatkan informasi video.');
      }
    } else {
      bot.sendMessage(chatId, 'Tolong kirim link YouTube yang valid.');
    }
  });
};
