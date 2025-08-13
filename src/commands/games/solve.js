const { games: mathGames } = require('./mathrace.js');

module.exports = {
    name: 'solve',
    category: 'games',
    description: 'Submit your answer for the math race.',
    emoji: '🙋‍♀️',
    async execute(sock, msg, args) {
        const { remoteJid, participant } = msg.key;
        const game = mathGames.get(remoteJid);

        if (!game) {
            return await sock.sendMessage(remoteJid, { text: 'There is no active math race. Start one with `.mathrace`.' }, { quoted: msg });
        }
        
        const userAnswer = parseInt(args[0]);
        if (isNaN(userAnswer)) {
            return await sock.sendMessage(remoteJid, { text: 'Please provide a numeric answer.' }, { quoted: msg });
        }

        if (userAnswer === game.answer) {
            const timeTaken = ((Date.now() - game.startTime) / 1000).toFixed(2);
            await sock.sendMessage(remoteJid, {
                text: `*Correct!* 🏆 @${participant.split('@')[0]} solved it in *${timeTaken} seconds!*\nThe answer was *${game.answer}*.`,
                mentions: [participant]
            });
            mathGames.delete(remoteJid);
        } else {
            await sock.sendMessage(remoteJid, { react: { text: '❌', key: msg.key } });
        }
    }
};