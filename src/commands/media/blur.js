const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'blur',
    category: 'media',
    description: 'Applies a blur effect to an image.',
    emoji: '🌫️',
    async execute(sock, msg, args) {
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const messageType = quotedMessage ? Object.keys(quotedMessage)[0] : Object.keys(msg.message)[0];
        const message = quotedMessage ? { key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quotedMessage } : msg;
        
        if (messageType !== 'imageMessage') {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to an image with the command.' }, { quoted: msg });
        }

        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Applying blur... ⏳' }, { quoted: msg });

        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            const outputPath = path.join(__dirname, `../../../temp_blur_${msg.key.id}.jpg`);

            // Get blur level from args, default to 5
            let blurLevel = parseInt(args[0]) || 5;
            if (blurLevel < 1) blurLevel = 1;
            if (blurLevel > 50) blurLevel = 50; // Cap at 50 to prevent long processing

            await sharp(buffer)
                .blur(blurLevel)
                .jpeg()
                .toFile(outputPath);

            await sock.sendMessage(msg.key.remoteJid, { image: { url: outputPath } }, { quoted: msg });

            fs.unlinkSync(outputPath);
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        } catch (e) {
            console.error('Blur command error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: 'An unexpected error occurred.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};