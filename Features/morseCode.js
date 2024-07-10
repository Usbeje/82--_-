const morse = require('morse');

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

module.exports = (bot) => {
  bot.onText(/\/morse (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const textToConvert = match[1];
    const morseCode = textToConvert.toLowerCase().split('').map(char => morseDict[char] || char).join(' ');
    bot.sendMessage(chatId, `Kode Morse dari "${textToConvert}" adalah:\n${morseCode}`);
  });

  bot.onText(/\/text (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const morseToConvert = match[1];
    const morseWords = morseToConvert.split(' / ');
    const plainText = morseWords.map(word => 
      word.split(' ').map(code => 
        Object.keys(morseDict).find(key => morseDict[key] === code) || code
      ).join('')
    ).join(' ');
    bot.sendMessage(chatId, `Teks dari kode Morse "${morseToConvert}" adalah:\n${plainText}`);
  });
};
