const { generate } = require('random-words');

// We need a shared state. A better way is a dedicated state manager, but for now, we can export the map.
const wordGuessGames = new Map();

function getDisplay(word, guessedLetters) {
    let display = '';
    for (const letter of word) {
        display += guessedLetters.has(letter) ? `${letter} ` : '_ ';
    }
    return '`' + display.trim() + '`';
}

module.exports = {
    name: 'wordguess',
    category: 'games',
    description: 'Starts a word guessing game.',
    emoji: '🤔',
    games: wordGuessGames, // Export for the 'guess' command to use
    async execute(sock, msg, args) {
        const { remoteJid } = msg.key;
        if (wordGuessGames.has(remoteJid)) {
            const game = wordGuessGames.get(remoteJid);
            return await sock.sendMessage(remoteJid, { text: `A game is already in progress!\n\n${getDisplay(game.word, game.guessedLetters)}\nAttempts left: ${'❤️'.repeat(game.attemptsLeft)}\n\nUse \`.guess <letter>\` to play.` }, { quoted: msg });
        }
        
        const word = generate();
        const game = {
            word: word.toLowerCase(),
            guessedLetters: new Set(),
            attemptsLeft: 6,
        };
        wordGuessGames.set(remoteJid, game);

        await sock.sendMessage(remoteJid, { text: `Word Guess game started!\n\nI'm thinking of a word with ${word.length} letters.\n\n${getDisplay(game.word, game.guessedLetters)}\nAttempts left: ${'❤️'.repeat(game.attemptsLeft)}\n\nUse \`.guess <letter>\` to guess.` }, { quoted: msg });
    }
};