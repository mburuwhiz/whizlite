const { applyFont } = require('../../utils/textStyler');

module.exports = {
    name: 'fancy',
    category: 'fun',
    description: 'Generates text in multiple fancy fonts.',
    emoji: '✒️',
    async execute(sock, msg, args) {
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide text to make fancy. Example: .fancy hello' }, { quoted: msg });
        }
        const text = args.join(' ');
        
        let fancyText = `*Fancy versions of "${text}":*\n\n`;
        fancyText += `*Bold:* ${applyFont(text, 'bold')}\n`;
        fancyText += `*Italic:* ${applyFont(text, 'italic')}\n`;
        fancyText += `*Monospace:* ${applyFont(text, 'monospace')}\n`;
        fancyText += `*Script:* ${applyFont(text, 'script')}\n`;
        fancyText += `*Gothic:* ${applyFont(text, 'gothic')}\n`;
        fancyText += `*Circled:* ${applyFont(text, 'circled')}`;

        await sock.sendMessage(msg.key.remoteJid, { text: fancyText }, { quoted: msg });
    }
};