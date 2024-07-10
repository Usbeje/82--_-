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

const reverseMorseDict = {};
for (let key in morseDict) {
  reverseMorseDict[morseDict[key]] = key;
}

const textToMorse = (text) => {
  return text.toLowerCase().split('').map(char => {
    return morseDict[char] || char; // Jika karakter tidak ada di kamus, biarkan apa adanya
  }).join(' ');
};

const morseToText = (morse) => {
  return morse.split(' ').map(code => {
    return reverseMorseDict[code] || code; // Jika kode Morse tidak ada di kamus, biarkan apa adanya
  }).join('');
};

module.exports = (bot) => {
  bot.action('start_morse', (ctx) => {
    ctx.reply('Kirim teks yang ingin dikonversi ke Morse atau kirim kode Morse yang ingin dikonversi ke teks. Gunakan format:\n/morse [teks]\n/text [kode Morse]');
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
};
