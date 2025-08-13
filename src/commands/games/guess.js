const { games: wordGuessGames } = require('./wordguess.js'); // Import the shared game state

function getDisplay(word, guessedLetters) {
    let display = '';
    for (const letter of word) {
        display += guessedLetters.has(letter) ? `${letter} ` : '_ ';
    }
    return '`' + display.trim() + '`';
}

module.exports = {
    name: 'guess',
    category: 'games',
    description: 'Make a guess in a Word Guess game.',
    emoji: '💬',
    async execute(sock, msg, args) {
        const { remoteJid } = msg.key;
        const game = wordGuessGames.get(remoteJid);

        if (!game) {
            return await sock.sendMessage(remoteJid, { text: 'No Word Guess game is currently running. Start one with `.wordguess`.' }, { quoted: msg });
        }
        
        const letter = args[0]?.toLowerCase();
        if (!letter || letter.length !== 1 || !/[a-z]/.test(letter)) {
            return await sock.sendMessage(remoteJid, { text: 'Please guess a single letter.' }, { quoted: msg });
        }

        if (game.guessedLetters.has(letter)) {
            return await sock.sendMessage(remoteJid, { text: `You already guessed the letter "${letter}".` }, { quoted: msg });
        }

        game.guessedLetters.add(letter);

        if (!game.word.includes(letter)) {
            game.attemptsLeft--;
            await sock.sendMessage(remoteJid, { text: `Incorrect! The letter "${letter}" is not in the word.` });
        }

        const currentDisplay = getDisplay(game.word, game.guessedLetters);
        let replyText = `${currentDisplay}\nGuessed: ${[...game.guessedLetters].join(', ')}\nAttempts left: ${'❤️'.repeat(game.attemptsLeft)}`;

        if (!currentDisplay.includes('_')) {
            replyText += `\n\nCongratulations! You guessed the word: *${game.word}*`;
            wordGuessGames.delete(remoteJid);
        } else if (game.attemptsLeft <= 0) {
            replyText += `\n\nGame Over! You ran out of attempts. The word was: *${game.word}*`;
            wordGuessGames.delete(remoteJid);
        }
        
        await sock.sendMessage(remoteJid, { text: replyText }, { quoted: msg });
    }
};