const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

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
      const title = sanitizeFileName(videoInfo.title);

      bot.sendMessage(chatId, `Downloading video: ${title}`);

      const filePath = await downloadVideo(videoId, title);
      if (!filePath) {
        throw new Error('Failed to download video.');
      }

      const fileType = filePath.endsWith('.mp3') ? 'audio' : 'video';
      if (fileType === 'video') {
        bot.sendVideo(chatId, filePath)
          .then(() => cleanupFiles([filePath]))
          .catch((err) => {
            bot.sendMessage(chatId, 'Failed to send video.');
            console.error('Error sending video:', err);
          });
      } else {
        bot.sendAudio(chatId, filePath)
          .then(() => cleanupFiles([filePath]))
          .catch((err) => {
            bot.sendMessage(chatId, 'Failed to send audio.');
            console.error('Error sending audio:', err);
          });
      }

    } catch (error) {
      bot.sendMessage(chatId, 'An error occurred while downloading the video.');
      console.error('Error:', error);
    }
  });

  function getYouTubeVideoId(url) {
    let videoId = null;
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else {
      const parsedUrl = new URL(url);
      const searchParams = parsedUrl.searchParams;
      videoId = searchParams.get('v');
    }
    return videoId;
  }

  async function fetchYouTubeVideoInfo(videoId) {
    const apiKey = 'AIzaSyCTTDoc3logk8bMmxS-ZbfsIMrJNGvfA2I'; // Replace with your actual YouTube API key
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`;

    try {
      const response = await axios.get(url);
      if (response.data.items.length > 0) {
        return {
          title: response.data.items[0].snippet.title,
          duration: response.data.items[0].contentDetails.duration
        };
      } else {
        throw new Error('Video not found.');
      }
    } catch (error) {
      throw new Error('Error fetching video information.');
    }
  }

  async function downloadVideo(videoId, title) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const filePath = path.join(__dirname, `${title}.mp4`);

    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
      });

      response.data.pipe(fs.createWriteStream(filePath));

      return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve(filePath));
        response.data.on('error', (err) => reject(err));
      });

    } catch (error) {
      console.error('Error downloading video:', error);
      return null;
    }
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

  function sanitizeFileName(fileName) {
    return fileName.replace(/[^a-zA-Z0-9 ]/g, '');
  }
};
