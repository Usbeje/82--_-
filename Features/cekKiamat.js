const fs = require('fs');
const path = require('path');

module.exports = (bot) => {
  bot.onText(/\/cek_kiamat/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const filePath = path.join(__dirname, 'kiamat.json');

    // Baca file kiamat.json
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        bot.sendMessage(chatId, 'Terjadi kesalahan saat membaca data.');
        return;
      }

      let userData = {};
      if (data) {
        userData = JSON.parse(data);
      }

      const today = new Date().toISOString().split('T')[0];

      if (userData[userId] === today) {
        bot.sendMessage(chatId, 'Anda sudah memeriksa kiamat hari ini. Coba lagi besok.');
      } else {
        userData[userId] = today;

        // Simpan data ke kiamat.json
        fs.writeFile(filePath, JSON.stringify(userData), 'utf8', (err) => {
          if (err) {
            console.error(err);
            bot.sendMessage(chatId, 'Terjadi kesalahan saat menyimpan data.');
            return;
          }

          bot.sendMessage(chatId, 'Hari ini bukan hari kiamat. Coba lagi besok.');
        });
      }
    });
  });
};
