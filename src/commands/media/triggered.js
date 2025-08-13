const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'triggered',
    category: 'media',
    description: 'Applies the "TRIGGERED" overlay to an image.',
    emoji: '😠',
    async execute(sock, msg, args) {
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const messageType = quotedMessage ? Object.keys(quotedMessage)[0] : Object.keys(msg.message)[0];
        const message = quotedMessage ? { key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quotedMessage } : msg;
        
        if (messageType !== 'imageMessage') {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to an image with the command.' }, { quoted: msg });
        }

        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Processing... ⏳' }, { quoted: msg });

        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            const overlayPath = path.join(__dirname, '../../../assets/triggered.png');
            const outputPath = path.join(__dirname, `../../../temp_triggered_${msg.key.id}.jpg`);

            const mainImage = sharp(buffer);
            const metadata = await mainImage.metadata();

            // Resize overlay to fit the width of the main image
            const overlay = await sharp(overlayPath)
                .resize({ width: metadata.width })
                .toBuffer();
            
            const overlayMetadata = await sharp(overlay).metadata();

            await mainImage
                .modulate({ brightness: 1, saturation: 1.5, hue: 0 }) // Slightly saturate
                .composite([{ 
                    input: overlay, 
                    // Place overlay at the bottom
                    top: metadata.height - overlayMetadata.height, 
                    left: 0 
                }])
                .jpeg()
                .toFile(outputPath);

            await sock.sendMessage(msg.key.remoteJid, { image: { url: outputPath } }, { quoted: msg });

            fs.unlinkSync(outputPath);
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        } catch (e) {
            console.error('Triggered command error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: 'An unexpected error occurred.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};