const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'sticker',
    category: 'media',
    description: 'Creates a sticker from an image, GIF, or short video.',
    emoji: '🖼️',
    async execute(sock, msg, args) {
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const messageType = quotedMessage ? Object.keys(quotedMessage)[0] : Object.keys(msg.message)[0];
        const message = quotedMessage ? { key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quotedMessage } : msg;
        
        if (messageType !== 'imageMessage' && messageType !== 'videoMessage') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to an image, GIF, or short video with the command.' }, { quoted: msg });
            return;
        }

        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Processing your sticker... ⏳' }, { quoted: msg });

        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            const tempPath = path.join(__dirname, `../../../temp_${msg.key.id}`);
            fs.writeFileSync(tempPath, buffer);

            const outputPath = path.join(__dirname, `../../../temp_sticker_${msg.key.id}.webp`);

            const ffmpegCommand = `ffmpeg -i "${tempPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=transparent" -c:v libwebp -lossless 1 -q:v 70 -y "${outputPath}"`;

            exec(ffmpegCommand, async (error) => {
                if (error) {
                    console.error('FFMPEG Error:', error);
                    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to create sticker. Make sure FFmpeg is installed.' }, { quoted: msg });
                } else {
                    await sock.sendMessage(msg.key.remoteJid, { sticker: { url: outputPath } }, { quoted: msg });
                }
                // Cleanup temporary files
                fs.unlinkSync(tempPath);
                fs.unlinkSync(outputPath);
                // Delete the spinner message
                await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
            });
        } catch (e) {
            console.error('Sticker command error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: 'An unexpected error occurred.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};