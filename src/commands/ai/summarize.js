const { OpenAI } = require('openai');
const config = require('../../config');

module.exports = {
    name: 'summarize',
    category: 'ai',
    description: 'Summarizes a long piece of text.',
    emoji: '📑',
    async execute(sock, msg, args) {
        if (!config.OPENAI_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The OpenAI API key is not set.' }, { quoted: msg });
        }
        
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let textToSummarize = args.join(' ');

        if (quotedMessage) {
            textToSummarize = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text;
        }

        if (!textToSummarize) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide text or reply to a message to summarize.' }, { quoted: msg });
        }
        
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Summarizing... ⏳' }, { quoted: msg });

        try {
            const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a highly skilled summarization assistant. Provide a concise summary of the given text, focusing on the key points.' },
                    { role: 'user', content: `Please summarize this text:\n\n"${textToSummarize}"` }
                ],
            });

            const summary = completion.choices[0].message.content;
            await sock.sendMessage(msg.key.remoteJid, { text: `*Summary:*\n\n${summary}`, edit: spinner.key });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ An error occurred while summarizing.' }, { quoted: msg, edit: spinner.key });
        }
    }
};