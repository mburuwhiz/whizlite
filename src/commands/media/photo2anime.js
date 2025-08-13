const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
const FormData = require('form-data');
const config = require('../../config');

module.exports = {
    name: 'photo2anime',
    category: 'media',
    description: 'Converts a photo into an anime style using AI.',
    emoji: '🎨',
    async execute(sock, msg, args) {
        if (!config.DEEPAI_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The DeepAI API key is not set. This command is disabled.' }, { quoted: msg });
        }
        
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const message = quotedMessage ? { key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quotedMessage } : msg;
        
        if (!message.message?.imageMessage) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to a photo of a person.' }, { quoted: msg });
        }

        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Applying anime filter... ⏳' }, { quoted: msg });

        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            
            const formData = new FormData();
            formData.append('image', buffer, 'image.jpg');

            const response = await axios.post('https://api.deepai.org/api/toonify', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'api-key': config.DEEPAI_API_KEY,
                },
            });

            const imageUrl = response.data.output_url;

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: imageUrl },
                caption: 'Here is your anime version!'
            }, { quoted: msg });
            
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });

        } catch (e) {
            console.error('DeepAI Toonify Error:', e.response?.data || e.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ An error occurred with the AI model.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};