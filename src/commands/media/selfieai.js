const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
const FormData = require('form-data');
const config = require('../../config');

module.exports = {
    name: 'selfieai',
    category: 'media',
    description: 'Enhances and upscales an image using AI.',
    emoji: '✨',
    async execute(sock, msg, args) {
        if (!config.DEEPAI_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The DeepAI API key is not set. This command is disabled.' }, { quoted: msg });
        }
        
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const message = quotedMessage ? { key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quotedMessage } : msg;
        
        if (!message.message?.imageMessage) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to an image to enhance it.' }, { quoted: msg });
        }

        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Enhancing image with AI... ⏳' }, { quoted: msg });

        try {
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            
            const formData = new FormData();
            formData.append('image', buffer, 'image.jpg');

            // We use the "torch-srgan" model for general purpose image enhancement
            const response = await axios.post('https://api.deepai.org/api/torch-srgan', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'api-key': config.DEEPAI_API_KEY,
                },
            });

            const imageUrl = response.data.output_url;

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: imageUrl },
                caption: 'Image enhanced!'
            }, { quoted: msg });
            
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });

        } catch (e) {
            console.error('DeepAI Enhance Error:', e.response?.data || e.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ An error occurred with the AI model.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};