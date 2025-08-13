const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'wasted',
    category: 'media',
    description: 'Applies the GTA "WASTED" overlay to an image.',
    emoji: '💀',
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
            const overlayPath = path.join(__dirname, '../../../assets/wasted.png');
            const outputPath = path.join(__dirname, `../../../temp_wasted_${msg.key.id}.jpg`);

            const mainImage = sharp(buffer);
            const metadata = await mainImage.metadata();

            const overlay = await sharp(overlayPath)
                .resize({ width: metadata.width })
                .toBuffer();

            await mainImage
                .grayscale()
                .composite([{ input: overlay, gravity: 'center' }])
                .jpeg()
                .toFile(outputPath);

            await sock.sendMessage(msg.key.remoteJid, { image: { url: outputPath } }, { quoted: msg });

            fs.unlinkSync(outputPath);
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        } catch (e) {
            console.error('Wasted command error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: 'An unexpected error occurred.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};