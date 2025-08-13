const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const config = require('../../config');

module.exports = {
    name: 'voice2text',
    category: 'ai',
    description: 'Transcribes a voice note to text using AI.',
    emoji: '✍️',
    async execute(sock, msg, args) {
        if (!config.OPENAI_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The OpenAI API key is not set. This command is disabled.' }, { quoted: msg });
        }

        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage || !quotedMessage.audioMessage) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to a voice note with the command.' }, { quoted: msg });
        }

        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Transcribing audio... 🎤' }, { quoted: msg });

        try {
            const buffer = await downloadMediaMessage({ message: { audioMessage: quotedMessage.audioMessage } }, 'buffer', {});
            const tempPath = path.join(__dirname, `../../../temp_audio_${msg.key.id}.ogg`);
            fs.writeFileSync(tempPath, buffer);

            const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(tempPath),
                model: 'whisper-1',
            });

            const transcribedText = `*Transcription:* \n\n"${transcription.text}"`;
            await sock.sendMessage(msg.key.remoteJid, { text: transcribedText }, { quoted: msg });

            fs.unlinkSync(tempPath);
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });

        } catch (e) {
            console.error('Whisper API Error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to transcribe the audio. It might be too long or in an unsupported format.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};