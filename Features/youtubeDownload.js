const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

module.exports = (bot) => {
  bot.onText(/\/download (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1];

    if (ytdl.validateURL(url)) {
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, "");

      bot.sendMessage(chatId, 'Pilih format download:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'MP4', callback_data: `mp4_${url}` }],
            [{ text: 'MP3', callback_data: `mp3_${url}` }]
          ]
        }
      });
    } else {
      bot.sendMessage(chatId, 'Tolong kirim link YouTube yang valid.');
    }
  });

  bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const [format, url] = callbackQuery.data.split('_');

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, "");
    const videoFileName = `Gabutc_exploitz_${title}.mp4`;
    const audioFileName = `Gabutc_exploitz_${title}.mp3`;

    if (format === 'mp4') {
      bot.sendMessage(chatId, 'Downloading your video as MP4...');
      ytdl(url, { quality: 'highestvideo' })
        .pipe(fs.createWriteStream(path.join(__dirname, videoFileName)))
        .on('finish', () => {
          bot.sendVideo(chatId, path.join(__dirname, videoFileName))
            .then(() => fs.unlinkSync(path.join(__dirname, videoFileName))); // Hapus file setelah dikirim
        })
        .on('error', (err) => {
          bot.sendMessage(chatId, 'An error occurred while downloading the video.');
          console.error(err);
        });
    } else if (format === 'mp3') {
      bot.sendMessage(chatId, 'Downloading your video as MP3...');
      const videoStream = ytdl(url, { quality: 'highestaudio' });
      ffmpeg(videoStream)
        .audioBitrate(128)
        .save(path.join(__dirname, audioFileName))
        .on('end', () => {
          bot.sendAudio(chatId, path.join(__dirname, audioFileName))
            .then(() => fs.unlinkSync(path.join(__dirname, audioFileName))); // Hapus file setelah dikirim
        })
        .on('error', (err) => {
          bot.sendMessage(chatId, 'An error occurred while converting the video.');
          console.error(err);
        });
    }
  });
};
