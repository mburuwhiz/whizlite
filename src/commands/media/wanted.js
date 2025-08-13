const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'wanted',
    category: 'media',
    description: 'Creates a "WANTED" poster from an image.',
    emoji: '🖼️',
    async execute(sock, msg, args) {
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const messageType = quotedMessage ? Object.keys(quotedMessage)[0] : Object.keys(msg.message)[0];
        const message = quotedMessage ? { key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quotedMessage } : msg;

        if (messageType !== 'imageMessage') {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to an image with the command.' }, { quoted: msg });
        }
        
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Generating WANTED poster... ⏳' }, { quoted: msg });

        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            const outputPath = path.join(__dirname, `../../../temp_wanted_${msg.key.id}.jpg`);

            // Create the poster background
            const posterWidth = 600;
            const posterHeight = 750;

            const poster = sharp({
                create: {
                    width: posterWidth,
                    height: posterHeight,
                    channels: 4,
                    background: { r: 242, g: 221, b: 169, alpha: 1 } // Sepia-like background
                }
            });

            // Process the user's image
            const image = await sharp(buffer)
                .resize(450, 450, { fit: 'cover', position: 'center' })
                .grayscale()
                .toBuffer();

            // Create the text overlays
            const wantedText = `
            <svg width="${posterWidth}" height="100">
                <style>
                .title { fill: #3a2b1b; font-size: 100px; font-weight: bold; font-family: 'Courier New', monospace; }
                </style>
                <text x="50%" y="80%" text-anchor="middle" class="title">WANTED</text>
            </svg>`;
            
            const rewardText = `
            <svg width="${posterWidth}" height="100">
                <style>
                .reward { fill: #3a2b1b; font-size: 40px; font-family: 'Courier New', monospace; }
                </style>
                <text x="50%" y="60%" text-anchor="middle" class="reward">$1,000,000 REWARD</text>
            </svg>`;

            // Composite everything together
            await poster
                .composite([
                    { input: Buffer.from(wantedText), top: 20, left: 0 },
                    { input: image, top: 120, left: 75 },
                    { input: Buffer.from(rewardText), top: 600, left: 0 }
                ])
                .jpeg()
                .toFile(outputPath);
            
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: outputPath },
                caption: "Dead or Alive"
            }, { quoted: msg });

            fs.unlinkSync(outputPath);
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });

        } catch (e) {
            console.error('Wanted command error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: 'An unexpected error occurred.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};