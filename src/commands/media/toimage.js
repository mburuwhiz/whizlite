const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'toimage',
    category: 'media',
    description: 'Converts a sticker to an image.',
    emoji: '📷',
    async execute(sock, msg, args) {
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage || !quotedMessage.stickerMessage) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to a sticker with the command.' }, { quoted: msg });
        }
        
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Converting sticker to image... ⏳' }, { quoted: msg });

        try {
            const buffer = await downloadMediaMessage({ message: { stickerMessage: quotedMessage.stickerMessage } }, 'buffer', {});
            const tempPath = path.join(__dirname, `../../../temp_sticker_${msg.key.id}.webp`);
            const outputPath = path.join(__dirname, `../../../temp_image_${msg.key.id}.jpg`);
            fs.writeFileSync(tempPath, buffer);
            
            // Use ffmpeg to convert webp to jpg
            exec(`ffmpeg -i "${tempPath}" "${outputPath}"`, async (error) => {
                if (error) {
                    console.error('FFMPEG Error:', error);
                    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to convert the sticker.' }, { quoted: msg });
                } else {
                    await sock.sendMessage(msg.key.remoteJid, { image: { url: outputPath } }, { quoted: msg });
                }
                // Cleanup
                fs.unlinkSync(tempPath);
                fs.unlinkSync(outputPath);
                await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
            });
        } catch (e) {
            console.error('ToImage command error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: 'An unexpected error occurred.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};