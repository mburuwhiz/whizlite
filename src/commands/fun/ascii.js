const figlet = require('figlet');

module.exports = {
    name: 'ascii',
    category: 'fun',
    description: 'Converts text into large ASCII art.',
    emoji: '✍️',
    async execute(sock, msg, args) {
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide text to convert. Example: .ascii art' }, { quoted: msg });
        }
        const text = args.join(' ');
        figlet(text, (err, data) => {
            if (err) {
                console.error('Figlet error:', err);
                return sock.sendMessage(msg.key.remoteJid, { text: 'An error occurred while generating ASCII art.' }, { quoted: msg });
            }
            sock.sendMessage(msg.key.remoteJid, { text: '```' + data + '```' }, { quoted: msg });
        });
    }
};