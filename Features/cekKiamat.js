const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, 'users.json');

function loadUsers() {
  if (fs.existsSync(usersFile)) {
    return JSON.parse(fs.readFileSync(usersFile));
  } else {
    return {};
  }
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users));
}

module.exports = (bot) => {
  bot.onText(/\/cekkiamat/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const users = loadUsers();

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (users[userId] && users[userId].lastCheck === today) {
      bot.sendMessage(chatId, 'Anda sudah cek kiamat hari ini. Silakan coba lagi besok.');
    } else {
      users[userId] = { lastCheck: today };
      saveUsers(users);
      bot.sendMessage(chatId, 'Tidak ada tanda-tanda kiamat hari ini. Silakan cek lagi besok.');
    }
  });
};
