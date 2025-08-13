const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const config = require('../../config');

module.exports = {
    name: 'removebg',
    category: 'media',
    description: 'Removes the background from an image.',
    emoji: '✂️',
    async execute(sock, msg, args) {
        if (!config.REMOVEBG_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The remove.bg API key is not set. This command is disabled.' }, { quoted: msg });
        }
        
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const message = quotedMessage ? { key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quotedMessage } : msg;
        
        if (!message.message?.imageMessage) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to an image with the command.' }, { quoted: msg });
        }

        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Removing background... ⏳' }, { quoted: msg });

        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            const outputPath = path.join(__dirname, `../../../temp_removebg_${msg.key.id}.png`);

            const formData = new FormData();
            formData.append('size', 'auto');
            formData.append('image_file', buffer, 'image.jpg');

            const response = await axios.post('https://api.remove.bg/v1/removebg', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'X-Api-Key': config.REMOVEBG_API_KEY,
                },
                responseType: 'arraybuffer',
            });

            fs.writeFileSync(outputPath, response.data);

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: outputPath },
                caption: 'Background removed successfully!'
            }, { quoted: msg });
            
            fs.unlinkSync(outputPath);
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });

        } catch (e) {
            console.error('RemoveBG Error:', e.response?.data?.toString() || e.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ An error occurred. You might be out of credits or the image is not supported.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};