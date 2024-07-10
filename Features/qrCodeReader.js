const axios = require('axios');
const FormData = require('form-data');

module.exports = (bot) => {
  bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    const fileUrl = await bot.getFileLink(fileId);

    try {
      const form = new FormData();
      form.append('file', fileUrl.href);

      const response = await axios.post('https://api.qrserver.com/v1/read-qr-code/', form, {
        headers: form.getHeaders(),
      });

      const qrData = response.data[0].symbol[0].data;
      if (qrData) {
        bot.sendMessage(chatId, `Kode QR berhasil diubah menjadi URL: ${qrData}`);
      } else {
        bot.sendMessage(chatId, 'Tidak dapat membaca kode QR.');
      }
    } catch (error) {
      bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses kode QR.');
      console.error(error);
    }
  });
};
