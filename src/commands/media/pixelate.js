const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'pixelate',
    category: 'media',
    description: 'Pixelates an image.',
    emoji: '👾',
    async execute(sock, msg, args) {
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const messageType = quotedMessage ? Object.keys(quotedMessage)[0] : Object.keys(msg.message)[0];
        const message = quotedMessage ? { key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quotedMessage } : msg;
        
        if (messageType !== 'imageMessage') {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to an image with the command.' }, { quoted: msg });
        }
        
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Pixelating... ⏳' }, { quoted: msg });
        
        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            const outputPath = path.join(__dirname, `../../../temp_pixelate_${msg.key.id}.jpg`);
            
            const image = sharp(buffer);
            const metadata = await image.metadata();
            
            // Calculate pixelation size, default to 20
            let pixelSize = parseInt(args[0]) || 20;
            if (pixelSize < 5) pixelSize = 5;
            if (pixelSize > 100) pixelSize = 100;

            await image
                .resize(Math.round(metadata.width / pixelSize), Math.round(metadata.height / pixelSize), {
                    kernel: sharp.kernel.nearest
                })
                .resize(metadata.width, metadata.height, {
                    kernel: sharp.kernel.nearest
                })
                .jpeg()
                .toFile(outputPath);
                
            await sock.sendMessage(msg.key.remoteJid, { image: { url: outputPath } }, { quoted: msg });
            
            fs.unlinkSync(outputPath);
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });

        } catch (e) {
            console.error('Pixelate command error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: 'An unexpected error occurred.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};