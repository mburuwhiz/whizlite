const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'translate',
    category: 'ai',
    description: 'Translates text to a specified language.',
    emoji: '🌐',
    async execute(sock, msg, args) {
        if (!config.DEEPL_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The DeepL API key is not set. This command is disabled.' }, { quoted: msg });
        }

        const targetLang = args[0];
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let textToTranslate = args.slice(1).join(' ');

        if (quotedMessage) {
            textToTranslate = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text;
            // If the user replies with the command, the first arg is the lang code
            if (!args[0]) return await sock.sendMessage(msg.key.remoteJid, { text: 'Please specify a target language code. Example: .translate es' }, { quoted: msg });
        }

        if (!textToTranslate || !targetLang) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: .translate <lang_code> <text>\nOr reply to a message: .translate <lang_code>' }, { quoted: msg });
        }

        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: `Translating to ${targetLang.toUpperCase()}...` }, { quoted: msg });

        try {
            const response = await axios.post('https://api-free.deepl.com/v2/translate', {
                text: [textToTranslate],
                target_lang: targetLang.toUpperCase(),
            }, {
                headers: {
                    'Authorization': `DeepL-Auth-Key ${config.DEEPL_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });

            const translatedText = response.data.translations[0].text;
            await sock.sendMessage(msg.key.remoteJid, { text: translatedText, edit: spinner.key });
        } catch (e) {
            console.error('DeepL API Error:', e.response?.data || e.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Translation failed. Please check if the language code is valid (e.g., EN, ES, SW, DE).' }, { quoted: msg, edit: spinner.key });
        }
    }
};