const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'circle',
    category: 'media',
    description: 'Crops an image into a circle.',
    emoji: '⭕',
    async execute(sock, msg, args) {
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const message = quotedMessage ? { key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quotedMessage } : msg;
        
        if (!message.message?.imageMessage) return await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to an image.' }, { quoted: msg });

        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Cropping to circle... ⏳' }, { quoted: msg });
        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            const outputPath = path.join(__dirname, `../../../temp_circle_${msg.key.id}.png`);

            const image = sharp(buffer);
            const metadata = await image.metadata();
            const size = Math.min(metadata.width, metadata.height);

            const circleSvg = Buffer.from(`<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" /></svg>`);

            await image
                .resize(size, size)
                .composite([{
                    input: circleSvg,
                    blend: 'dest-in'
                }])
                .png()
                .toFile(outputPath);

            await sock.sendMessage(msg.key.remoteJid, { image: { url: outputPath } }, { quoted: msg });
            
            fs.unlinkSync(outputPath);
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        } catch (e) {
            console.error(e)
            await sock.sendMessage(msg.key.remoteJid, { text: 'An error occurred.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};