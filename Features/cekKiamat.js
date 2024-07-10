const fs = require('fs');
const path = require('path');

const lastCheckFilePath = path.join(__dirname, 'lastCheck.json');

// Membaca data terakhir cek kiamat dari file
const readLastCheckData = () => {
  if (fs.existsSync(lastCheckFilePath)) {
    const data = fs.readFileSync(lastCheckFilePath, 'utf8');
    return JSON.parse(data);
  }
  return {};
};

// Menyimpan data terakhir cek kiamat ke file
const saveLastCheckData = (data) => {
  fs.writeFileSync(lastCheckFilePath, JSON.stringify(data));
};

module.exports = (bot) => {
  bot.action('start_kiamat', (ctx) => {
    const userId = ctx.from.id;
    const lastCheckData = readLastCheckData();

    const lastCheckTime = lastCheckData[userId];
    const currentTime = new Date().getTime();

    if (lastCheckTime && currentTime - lastCheckTime < 24 * 60 * 60 * 1000) {
      ctx.reply('Anda hanya bisa cek kiamat sekali sehari. Silakan coba lagi besok.');
    } else {
      // Update waktu terakhir cek kiamat
      lastCheckData[userId] = currentTime;
      saveLastCheckData(lastCheckData);

      // Menampilkan pesan cek kiamat
      ctx.reply('Cek kiamat: Hari ini belum kiamat. Silakan cek lagi besok.');
    }
  });
};
