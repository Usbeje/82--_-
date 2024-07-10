const TelegramBot = require('node-telegram-bot-api');
const qrCodeReader = require('./Features/qrCodeReader');
const youtubeDownload = require('./Features/youtubeDownload');
const morseCode = require('./Features/morseCode');
const cekKiamat = require('./Features/cekKiamat');

// Masukkan token bot Anda di sini
const token = '7323908580:AAEJRXUBNDaVNUHK-6XmOr7ycLG65fqq1X8';

// Buat instance bot
const bot = new TelegramBot(token, { polling: true });

// Jalankan semua fitur
qrCodeReader(bot);
youtubeDownload(bot);
morseCode(bot);
cekKiamat(bot);

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Selamat datang! Gunakan perintah berikut untuk fitur yang tersedia:\n/qr untuk memulai fitur QR Code\n/morse untuk memulai fitur Kode Morse\n/download untuk memulai fitur Download YouTube\n/cek_kiamat untuk memeriksa hari kiamat');
});

console.log('Bot is running...');
