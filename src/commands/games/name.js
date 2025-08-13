const { games: categoryGames } = require('./categories.js');

module.exports = {
    name: 'name',
    category: 'games',
    description: 'Submit your answer for the categories game.',
    emoji: '✍️',
    async execute(sock, msg, args) {
        const { remoteJid, participant } = msg.key;
        const game = categoryGames.get(remoteJid);

        if (!game) {
            return await sock.sendMessage(remoteJid, { text: 'There is no active Categories game. Start one with `.categories`.' }, { quoted: msg });
        }
        
        const userAnswer = args.join(' ').toLowerCase().trim();
        if (!userAnswer) {
            return await sock.sendMessage(remoteJid, { text: 'Please provide an answer.' }, { quoted: msg });
        }

        if (game.answers.has(userAnswer)) {
            await sock.sendMessage(remoteJid, {
                text: `*Correct!* 🏆 @${participant.split('@')[0]} wins! *"${userAnswer.charAt(0).toUpperCase() + userAnswer.slice(1)}"* is a valid answer.`,
                mentions: [participant]
            });
            categoryGames.delete(remoteJid);
        } else {
            await sock.sendMessage(remoteJid, { react: { text: '❌', key: msg.key } });
        }
    }
};