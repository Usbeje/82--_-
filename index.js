const TelegramBot = require('node-telegram-bot-api');
const morseCode = require('./features/morseCode');
const qrCodeReader = require('./features/qrCodeReader');
const youtubeDownload = require('./features/youtubeDownload');

// Masukkan token bot Anda di sini
const token = '7323908580:AAEJRXUBNDaVNUHK-6XmOr7ycLG65fqq1X8';

// Buat instance bot
const bot = new TelegramBot(token, { polling: true });

// Gunakan fitur
morseCode(bot);
qrCodeReader(bot);
youtubeDownload(bot);

console.log('Bot sedang berjalan...');
