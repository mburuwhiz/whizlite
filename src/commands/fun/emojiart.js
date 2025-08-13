const { emojify } = require('../../utils/textStyler');

module.exports = {
    name: 'emojiart',
    category: 'fun',
    description: 'Converts text into emoji letters.',
    emoji: '🎨',
    async execute(sock, msg, args) {
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide text to emojify.' }, { quoted: msg });
        }
        const text = args.join(' ').replace(/ /g, '  '); // Add extra space for word separation
        const emojiText = emojify(text);
        await sock.sendMessage(msg.key.remoteJid, { text: emojiText }, { quoted: msg });
    }
};