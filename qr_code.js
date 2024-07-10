const axios = require('axios');
const FormData = require('form-data');

module.exports = (bot) => {
  bot.action('start_qr', (ctx) => {
    ctx.reply('Silakan kirim gambar kode QR.');
  });

  bot.on('photo', async (ctx) => {
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const fileUrl = await ctx.telegram.getFileLink(fileId);

    try {
      const form = new FormData();
      form.append('file', fileUrl.href);

      const response = await axios.post('https://api.qrserver.com/v1/read-qr-code/', form, {
        headers: form.getHeaders(),
      });

      const qrData = response.data[0].symbol[0].data;
      if (qrData) {
        ctx.reply(`Kode QR berhasil diubah menjadi URL: ${qrData}`);
      } else {
        ctx.reply('Tidak dapat membaca kode QR.');
      }
    } catch (error) {
      ctx.reply('Terjadi kesalahan saat memproses kode QR.');
      console.error(error);
    }
  });
};
