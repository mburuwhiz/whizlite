const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'text2voice',
    category: 'ai',
    description: 'Converts text to a voice note (Text-to-Speech).',
    emoji: '🗣️',
    async execute(sock, msg, args) {
        if (args.length < 2) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: .text2voice <lang_code> <text>\n*Example:* .text2voice en Hello world' }, { quoted: msg });
        }

        const lang = args[0];
        const text = args.slice(1).join(' ');
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Converting text to voice... ⏳' }, { quoted: msg });

        try {
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'arraybuffer',
            });

            const outputPath = path.join(__dirname, `../../../temp_tts_${msg.key.id}.mp3`);
            fs.writeFileSync(outputPath, response.data);

            await sock.sendMessage(msg.key.remoteJid, {
                audio: { url: outputPath },
                mimetype: 'audio/mpeg',
                ptt: true // This makes it appear as a voice note
            }, { quoted: msg });
            
            fs.unlinkSync(outputPath);
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });

        } catch (e) {
            console.error('TTS Error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to generate voice note. Please check if the language code is correct (e.g., en, es, sw).' }, { quoted: msg, edit: spinner.key });
        }
    }
};