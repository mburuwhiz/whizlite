module.exports = {
    name: 'say',
    category: 'fun',
    description: 'Makes the bot repeat your message.',
    emoji: '💬',
    async execute(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, { text: 'What should I say? Example: .say Hello World' }, { quoted: msg });
            return;
        }
        const textToSay = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, { text: textToSay });
    }
};