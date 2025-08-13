const { flipText } = require('../../utils/textStyler');

module.exports = {
    name: 'fliptext',
    category: 'fun',
    description: 'Flips text upside down.',
    emoji: '🙃',
    async execute(sock, msg, args) {
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: '˙sᴉɥʇ ǝʞᴉl ʇxǝʇ pǝpᴉʌoɹd ǝʌɐɥ noʎ ɥsᴉʍ I' }, { quoted: msg });
        }
        const text = args.join(' ');
        const flipped = flipText(text);
        await sock.sendMessage(msg.key.remoteJid, { text: flipped }, { quoted: msg });
    }
};