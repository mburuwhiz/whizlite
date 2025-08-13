const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'sepia',
    category: 'media',
    description: 'Applies a classic sepia effect to an image.',
    emoji: '📜',
    async execute(sock, msg, args) {
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const message = quotedMessage ? { key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quotedMessage } : msg;
        
        if (!message.message?.imageMessage) return await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to an image.' }, { quoted: msg });

        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Applying effect... ⏳' }, { quoted: msg });
        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            const outputPath = path.join(__dirname, `../../../temp_sepia_${msg.key.id}.jpg`);

            await sharp(buffer).sepia().jpeg().toFile(outputPath);
                
            await sock.sendMessage(msg.key.remoteJid, { image: { url: outputPath } }, { quoted: msg });
            
            fs.unlinkSync(outputPath);
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: 'An error occurred.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};