const { games: flagGames } = require('./flagquiz.js'); // Import the shared game state

module.exports = {
    name: 'g',
    category: 'games',
    description: 'Submit your guess for the flag quiz.',
    emoji: '🙋‍♂️',
    async execute(sock, msg, args) {
        const { remoteJid, participant } = msg.key;
        const game = flagGames.get(remoteJid);

        if (!game) {
            return await sock.sendMessage(remoteJid, { text: 'There is no active flag quiz. Start one with `.flagquiz`.' }, { quoted: msg });
        }

        const userGuess = args.join(' ').toLowerCase().trim();
        if (!userGuess) {
            return await sock.sendMessage(remoteJid, { text: 'Please provide a guess!' }, { quoted: msg });
        }

        if (userGuess === game.correctAnswer.toLowerCase()) {
            await sock.sendMessage(remoteJid, {
                text: `*Correct!* 🎉 @${participant.split('@')[0]} guessed it right! The answer was *${game.correctAnswer}*.`,
                mentions: [participant]
            });
            flagGames.delete(remoteJid); // End the game
        } else {
            // If the guess is wrong, react with a cross mark
            await sock.sendMessage(remoteJid, { react: { text: '❌', key: msg.key } });
        }
    }
};