module.exports = {
    name: 'jsonparse',
    category: 'tools',
    description: 'Formats (pretty-prints) a JSON string.',
    emoji: '📄',
    async execute(sock, msg, args) {
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let jsonString = args.join(' ');

        if (quotedMessage) {
            jsonString = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text;
        }

        if (!jsonString) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a JSON string or reply to a message containing one.' }, { quoted: msg });
        }
        
        try {
            const parsedJson = JSON.parse(jsonString);
            const formattedJson = JSON.stringify(parsedJson, null, 2);
            await sock.sendMessage(msg.key.remoteJid, { text: '```' + formattedJson + '```' }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid JSON string.' }, { quoted: msg });
        }
    }
};