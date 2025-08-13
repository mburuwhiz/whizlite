const { games: triviaGames } = require('./trivia.js');

module.exports = {
    name: 'answer',
    category: 'games',
    description: 'Submit an answer for a trivia question.',
    emoji: '🙋',
    async execute(sock, msg, args) {
        const { remoteJid, participant } = msg.key;
        const game = triviaGames.get(remoteJid);
        if (!game) {
            return await sock.sendMessage(remoteJid, { text: 'There is no active trivia question. Start one with `.trivia`.' }, { quoted: msg });
        }
        
        const userAnswer = args[0]?.toUpperCase();
        if (!userAnswer || !['A', 'B', 'C', 'D'].includes(userAnswer)) {
            return await sock.sendMessage(remoteJid, { text: 'Please provide a valid answer (A, B, C, or D).' }, { quoted: msg });
        }
        
        let replyText;
        if (userAnswer === game.correctLetter) {
            replyText = `*Correct!* 🎉 @${participant.split('@')[0]} got the right answer: *${game.correctAnswer}*`;
        } else {
            replyText = `*Sorry, that's incorrect.* The correct answer was *${game.correctAnswer}*.`;
        }

        triviaGames.delete(remoteJid); // End the game
        await sock.sendMessage(remoteJid, { text: replyText, mentions: [participant] });
    }
};