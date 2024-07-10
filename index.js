const { Telegraf, Markup } = require('telegraf');
const qrCodeReader = require('./features/qrCodeReader');
const youtubeDownload = require('./features/youtubeDownload');
const morseCode = require('./features/morseCode');
const cekKiamat = require('./features/cekKiamat');

// Ganti dengan token bot Telegram Anda
const TELEGRAM_BOT_TOKEN = '7323908580:AAEJRXUBNDaVNUHK-6XmOr7ycLG65fqq1X8';

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    'Selamat datang! Pilih fitur yang ingin Anda gunakan:',
    Markup.inlineKeyboard([
      [Markup.button.callback('Kode QR', 'start_qr')],
      [Markup.button.callback('Download YouTube', 'start_download')],
      [Markup.button.callback('Kode Morse', 'start_morse')],
      [Markup.button.callback('Cek Kiamat', 'start_kiamat')]
    ])
  );
});

qrCodeReader(bot);
youtubeDownload(bot);
morseCode(bot);
cekKiamat(bot);

bot.launch();
