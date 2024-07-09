const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// Ganti dengan token bot Telegram Anda
const token = '7323908580:AAEJRXUBNDaVNUHK-6XmOr7ycLG65fqq1X8';

// Buat bot yang menggunakan 'polling' untuk mendapatkan pembaruan baru
const bot = new TelegramBot(token, { polling: true });

// Kamus untuk konversi kode Morse
const morseDict = {
    'a': '•–', 'b': '–•••', 'c': '–•–•', 'd': '–••', 'e': '•',
    'f': '••–•', 'g': '––•', 'h': '••••', 'i': '••', 'j': '•–––',
    'k': '–•–', 'l': '•–••', 'm': '––', 'n': '–•', 'o': '–––',
    'p': '•––•', 'q': '––•–', 'r': '•–•', 's': '•••', 't': '–',
    'u': '••–', 'v': '•••–', 'w': '•––', 'x': '–••–', 'y': '–•––',
    'z': '––••', '1': '•––––', '2': '••–––', '3': '•••––', '4': '••••–',
    '5': '•••••', '6': '–••••', '7': '––•••', '8': '–––••', '9': '––––•',
    '0': '–––––', ' ': '/'
};

// Kamus terbalik untuk konversi Morse ke teks
const reverseMorseDict = {};
for (let key in morseDict) {
    reverseMorseDict[morseDict[key]] = key;
}

// Fungsi untuk mengonversi teks ke Morse
const textToMorse = (text) => {
    return text.toLowerCase().split('').map(char => {
        return morseDict[char] || char; // Jika karakter tidak ada di kamus, biarkan apa adanya
    }).join(' ');
};

// Fungsi untuk mengonversi Morse ke teks
const morseToText = (morse) => {
    return morse.split(' ').map(code => {
        return reverseMorseDict[code] || code; // Jika kode Morse tidak ada di kamus, biarkan apa adanya
    }).join('');
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = 'Selamat datang! Pilih opsi berikut:';
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Kode Morse', callback_data: 'morse' }],
                [{ text: 'Download YouTube', callback_data: 'download' }]
            ]
        }
    };

    bot.sendMessage(chatId, welcomeMessage, options);
});

bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const data = callbackQuery.data;

    if (data === 'morse') {
        bot.sendMessage(chatId, 'Kirim teks yang ingin dikonversi ke Morse atau kirim kode Morse yang ingin dikonversi ke teks. Gunakan format:\n/morse [teks]\n/text [kode Morse]');
    } else if (data === 'download') {
        bot.sendMessage(chatId, 'Kirim link YouTube yang ingin Anda download. Gunakan format:\n/download [link YouTube]');
    }
});

bot.onText(/\/morse (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];

    let morse = textToMorse(text);
    bot.sendMessage(chatId, `Kode morse:\n\n${morse}`);
});

bot.onText(/\/text (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const morse = match[1];

    let text = morseToText(morse);
    bot.sendMessage(chatId, `Teks:\n\n${text}`);
});

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

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text.startsWith('/morse') && !text.startsWith('/text') && !text.startsWith('/download') && !text.startsWith('/start')) {
        bot.sendMessage(chatId, 'Gunakan perintah /morse, /text, atau /download untuk menggunakan fitur bot ini. Ketik /start untuk memulai.');
    }
});

console.log('Bot is running...');
