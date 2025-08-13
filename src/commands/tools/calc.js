const { evaluate } = require('mathjs');

module.exports = {
    name: 'calc',
    category: 'tools',
    description: 'A safe and powerful calculator.',
    emoji: '🧮',
    async execute(sock, msg, args) {
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a mathematical expression to calculate.' }, { quoted: msg });
        }
        const expression = args.join(' ');
        try {
            const result = evaluate(expression);
            await sock.sendMessage(msg.key.remoteJid, { text: `*Result:* \n\`\`\`${result}\`\`\`` }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid mathematical expression.' }, { quoted: msg });
        }
    }
};