const { OpenAI } = require('openai');
const config = require('../../config');

module.exports = {
    name: 'explain',
    category: 'ai',
    description: 'Explains a topic in simple terms.',
    emoji: '💡',
    async execute(sock, msg, args) {
        if (!config.OPENAI_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The OpenAI API key is not set.' }, { quoted: msg });
        }
        
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a topic for me to explain.' }, { quoted: msg });
        }

        const topic = args.join(' ');
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: `Explaining *${topic}*... ⏳` }, { quoted: msg });

        try {
            const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a talented teacher who can explain complex topics in a simple, clear, and easy-to-understand way for a beginner.' },
                    { role: 'user', content: `Please explain this topic:\n\n"${topic}"` }
                ],
            });

            const explanation = completion.choices[0].message.content;
            await sock.sendMessage(msg.key.remoteJid, { text: explanation, edit: spinner.key });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ An error occurred while generating the explanation.' }, { quoted: msg, edit: spinner.key });
        }
    }
};