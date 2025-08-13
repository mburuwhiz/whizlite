const { OpenAI } = require('openai');
const config = require('../../config');
const { getHistory, setHistory, clearHistory } = require('../../utils/conversationStore');

module.exports = {
    name: 'ai',
    category: 'ai',
    description: 'Engages in a conversation with OpenAI\'s GPT model.',
    emoji: '🧠',
    async execute(sock, msg, args) {
        if (!config.OPENAI_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The OpenAI API key is not set. This command is disabled.' }, { quoted: msg });
        }
        
        const userId = msg.key.remoteJid;
        const prompt = args.join(' ');

        // Command to clear conversation history
        if (prompt.toLowerCase() === 'clear') {
            clearHistory(userId);
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Conversation history cleared.' }, { quoted: msg });
        }

        if (!prompt) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Hello! What can I help you with today? To clear our conversation history, send `.ai clear`.' }, { quoted: msg });
        }

        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Thinking... 🤔' }, { quoted: msg });
        
        try {
            const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
            
            // Get user's conversation history
            let userHistory = getHistory(userId);

            // Add the new user prompt to the history
            userHistory.push({ role: 'user', content: prompt });

            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are WHIZLITE, a helpful and friendly WhatsApp assistant. Keep your responses concise and well-formatted for a chat screen.' },
                    ...userHistory // Include the entire conversation history
                ],
            });

            const aiResponse = completion.choices[0].message.content;

            // Add the AI's response to the history
            userHistory.push({ role: 'assistant', content: aiResponse });
            setHistory(userId, userHistory); // Save the updated history

            await sock.sendMessage(msg.key.remoteJid, { text: aiResponse, edit: spinner.key });

        } catch (e) {
            console.error('OpenAI Error:', e.response?.data || e.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ An error occurred with the AI model. Please try again later.' }, { quoted: msg, edit: spinner.key });
        }
    }
};