const { OpenAI } = require('openai');
const config = require('../../config');

module.exports = {
    name: 'rewrite',
    category: 'ai',
    description: 'Rewrites text to improve clarity and style.',
    emoji: '✍️',
    async execute(sock, msg, args) {
        if (!config.OPENAI_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The OpenAI API key is not set.' }, { quoted: msg });
        }
        
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let textToRewrite = args.join(' ');

        if (quotedMessage) {
            textToRewrite = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text;
        }

        if (!textToRewrite) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide text or reply to a message to rewrite.' }, { quoted: msg });
        }
        
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Rewriting... ⏳' }, { quoted: msg });

        try {
            const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are an expert editor. Rewrite the following text to improve its clarity, flow, and style, while preserving the original meaning. Respond only with the rewritten text.' },
                    { role: 'user', content: `Rewrite this:\n\n"${textToRewrite}"` }
                ],
            });

            const rewrittenText = completion.choices[0].message.content;
            await sock.sendMessage(msg.key.remoteJid, { text: `*Rewritten Version:*\n\n${rewrittenText}`, edit: spinner.key });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ An error occurred while rewriting.' }, { quoted: msg, edit: spinner.key });
        }
    }
};