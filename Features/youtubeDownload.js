const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = (bot) => {
  bot.onText(/\/download (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1];

    try {
      const videoId = getYouTubeVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL.');
      }

      const videoInfo = await fetchYouTubeVideoInfo(videoId);
      const title = videoInfo.title.replace(/[^a-zA-Z0-9 ]/g, '');

      bot.sendMessage(chatId, `Downloading video: ${title}`);

      downloadVideo(url, chatId)
        .then((filePath) => {
          const fileType = filePath.endsWith('.mp3') ? 'audio' : 'video';
          if (fileType === 'video') {
            bot.sendVideo(chatId, filePath)
              .then(() => cleanupFiles([filePath]));
          } else {
            bot.sendAudio(chatId, filePath)
              .then(() => cleanupFiles([filePath]));
          }
        })
        .catch((err) => {
          bot.sendMessage(chatId, 'An error occurred while downloading the video.');
          console.error(err);
        });

    } catch (error) {
      console.error('Error:', error);
      bot.sendMessage(chatId, 'Error: ' + error.message);
    }
  });

  function getYouTubeVideoId(url) {
    let videoId = null;
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else {
      const parsedUrl = new URL(url);
      const searchParams = new URLSearchParams(parsedUrl.search);
      videoId = searchParams.get('v');
    }
    return videoId;
  }

  async function fetchYouTubeVideoInfo(videoId) {
    const url = `https://www.youtube.com/get_video_info?video_id=${videoId}`;
    const response = await axios.get(url);
    const info = parseQueryString(response.data);
    return info;
  }

  function parseQueryString(queryString) {
    const params = {};
    const queries = queryString.split('&');
    queries.forEach((query) => {
      const pair = query.split('=');
      params[pair[0]] = decodeURIComponent(pair[1] || '');
    });
    return params;
  }

  async function downloadVideo(url, chatId) {
    const videoId = getYouTubeVideoId(url);
    const videoInfo = await fetchYouTubeVideoInfo(videoId);
    const streamUrl = videoInfo.url_encoded_fmt_stream_map.split(',')[0].split('url=')[1];

    const response = await axios.get(streamUrl, {
      responseType: 'stream'
    });

    let fileExtension = '.mp4'; // Default to MP4
    if (videoInfo.adaptive_fmts) {
      const adaptiveFormats = videoInfo.adaptive_fmts.split(',');
      const format = adaptiveFormats.find(format => format.includes('audio'));
      if (format) {
        const itag = format.split('itag=')[1].split('&')[0];
        fileExtension = itag === '140' ? '.mp4' : '.webm'; // Choose .mp4 for itag 140 (AAC) and .webm for others
      }
    }

    const outputPath = path.join(__dirname, `${videoId}${fileExtension}`);
    const writer = fs.createWriteStream(outputPath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  }

  function cleanupFiles(files) {
    files.forEach((file) => {
      try {
        fs.unlinkSync(file);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    });
  }
};
