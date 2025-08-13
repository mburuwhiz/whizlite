const { generateZalgo } = require('../../utils/textStyler');

module.exports = {
    name: 'zalgo',
    category: 'fun',
    description: 'Generates cursed zalgo text.',
    emoji: '👹',
    async execute(sock, msg, args) {
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'P̸r̸o̸v̸i̸d̸e̸ ̸t̸e̸x̸t̸ ̸t̸o̸ ̸c̸u̸r̸s̸e̸.̸' }, { quoted: msg });
        }
        const text = args.join(' ');
        const zalgoText = generateZalgo(text);
        await sock.sendMessage(msg.key.remoteJid, { text: zalgoText }, { quoted: msg });
    }
};