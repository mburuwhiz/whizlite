const { OpenAI } = require('openai');
const config = require('../../config');

module.exports = {
    name: 'img',
    category: 'search',
    description: 'Generates an AI image using DALL-E.',
    emoji: '🤖',
    async execute(sock, msg, args) {
        if (!config.OPENAI_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The OpenAI API key is not set. This command is disabled.' }, { quoted: msg });
        }
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a prompt to generate an image. Example: .img a lion wearing a crown' }, { quoted: msg });
        }
        
        const prompt = args.join(' ');
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: `🎨 Generating AI image for:\n*${prompt}*` }, { quoted: msg });

        try {
            const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
            });
            
            const imageUrl = response.data[0].url;
            
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: imageUrl },
                caption: `Here is your AI-generated image for:\n*${prompt}*`
            }, { quoted: msg });

            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });

        } catch (e) {
            console.error('DALL-E Error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to generate the image. The prompt may have been rejected by the safety system, or there was an API error.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};