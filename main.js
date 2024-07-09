const TelegramBot = require('node-telegram-bot-api');

// Replace with your Telegram bot token
const token = '7323908580:AAEJRXUBNDaVNUHK-6XmOr7ycLG65fqq1X8';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Dictionary for Morse code conversion
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

// Reverse dictionary for Morse code to text conversion
const reverseMorseDict = {};
for (let key in morseDict) {
    reverseMorseDict[morseDict[key]] = key;
}

// Function to convert text to Morse code
const textToMorse = (text) => {
    return text.toLowerCase().split('').map(char => {
        return morseDict[char] || char; // If character not in dictionary, leave it as is
    }).join(' ');
};

// Function to convert Morse code to text
const morseToText = (morse) => {
    return morse.split(' ').map(code => {
        return reverseMorseDict[code] || code; // If Morse code not in dictionary, leave it as is
    }).join('');
};

// Listen for messages starting with '/morse' to convert text to Morse code
bot.onText(/\/morse (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];

    let morse = textToMorse(text);
    bot.sendMessage(chatId, `Kode morse:\n\n${morse}`);
});

// Listen for messages starting with '/text' to convert Morse code to text
bot.onText(/\/text (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const morse = match[1];

    let text = morseToText(morse);
    bot.sendMessage(chatId, `Teks:\n\n${text}`);
});

// Handle /start command to show the help message
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
Sure! Here's the corrected version:

Hi, I'm a bot created by Gabutc_exploitz. I'm here to help you solve Morse code😁!

Gunakan perintah berikut:

- /morse [teks]: Untuk mengonversi teks ke kode Morse.
- /text [kode Morse]: Untuk mengonversi kode Morse ke teks.

Contoh:
- /morse halo
- /text •– •–• •–•• –•`;

    bot.sendMessage(chatId, helpMessage);
});

// Handle general messages to show a reminder to use commands
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text.startsWith('/morse') && !text.startsWith('/text') && !text.startsWith('/help')) {
        bot.sendMessage(chatId, 'Gunakan perintah /morse atau /text untuk mengonversi teks. Ketik /help untuk bantuan.');
    }
});

console.log('Bot is running...');
