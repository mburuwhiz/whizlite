const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'glitch',
    category: 'media',
    description: 'Applies a glitchy color-separation effect to an image.',
    emoji: '💥',
    async execute(sock, msg, args) {
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const message = quotedMessage ? { key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quotedMessage } : msg;
        
        if (!message.message?.imageMessage) return await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to an image.' }, { quoted: msg });

        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Applying glitch effect... ⏳' }, { quoted: msg });
        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            const outputPath = path.join(__dirname, `../../../temp_glitch_${msg.key.id}.jpg`);

            const image = sharp(buffer);
            const { width, height } = await image.metadata();

            const offset = Math.floor(width * 0.03); // 3% offset

            // Extract color channels
            const rChannel = await image.clone().extractChannel('red').toBuffer();
            const gChannel = await image.clone().extractChannel('green').toBuffer();
            const bChannel = await image.clone().extractChannel('blue').toBuffer();

            // Create a base image and composite the channels with offsets
            await sharp({ create: { width, height, channels: 3, background: 'black' } })
                .composite([
                    { input: rChannel, blend: 'add', left: offset, top: 0 },
                    { input: gChannel, blend: 'add', left: 0, top: 0 },
                    { input: bChannel, blend: 'add', left: -offset, top: 0 },
                ])
                .jpeg()
                .toFile(outputPath);

            await sock.sendMessage(msg.key.remoteJid, { image: { url: outputPath } }, { quoted: msg });
            
            fs.unlinkSync(outputPath);
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        } catch (e) {
            console.error(e);
            await sock.sendMessage(msg.key.remoteJid, { text: 'An error occurred.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};