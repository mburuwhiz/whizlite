const { applyFont } = require('../../utils/textStyler');

module.exports = {
    name: 'weirdify',
    category: 'fun',
    description: 'Applies a random weird font to your text.',
    emoji: '🌀',
    async execute(sock, msg, args) {
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide text to make weird!' }, { quoted: msg });
        }
        const text = args.join(' ');
        const fonts = ['gothic', 'script', 'circled'];
        const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
        const weirdText = applyFont(text, randomFont);
        await sock.sendMessage(msg.key.remoteJid, { text: weirdText }, { quoted: msg });
    }
};