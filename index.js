const TelegramBot = require('node-telegram-bot-api');
const morseCode = require('./features/morseCode');
const qrCodeReader = require('./features/qrCodeReader');
const youtubeDownload = require('./features/youtubeDownload');

// Masukkan token bot Anda di sini
const token = '7323908580:AAEJRXUBNDaVNUHK-6XmOr7ycLG65fqq1X8';

// Buat instance bot
const bot = new TelegramBot(token, { polling: true });

// Menu utama
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Kode Morse', callback_data: 'morse' }],
        [{ text: 'Pembaca QR', callback_data: 'qr' }],
        [{ text: 'Download YouTube', callback_data: 'youtube' }]
      ]
    }
  };

  bot.sendMessage(chatId, 'Silakan pilih fitur:', options);
});

// Handler untuk button
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data === 'morse') {
    bot.sendMessage(chatId, 'Kirim teks yang ingin dikonversi ke Morse atau kirim kode Morse yang ingin dikonversi ke teks. Gunakan format:\n/morse [teks]\n/text [kode Morse]');
  } else if (data === 'qr') {
    bot.sendMessage(chatId, 'Silakan kirim gambar kode QR.');
  } else if (data === 'youtube') {
    bot.sendMessage(chatId, 'Kirim link YouTube yang ingin Anda download. Gunakan format:\n/download [link YouTube]');
  }
});

// Gunakan fitur
morseCode(bot);
qrCodeReader(bot);
youtubeDownload(bot);

console.log('Bot sedang berjalan...');
