const axios = require('axios');

module.exports = {
    name: 'meme',
    category: 'fun',
    description: 'Fetches a random meme from the internet.',
    emoji: '😂',
    async execute(sock, msg, args) {
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Fetching a fresh meme... ⏳' }, { quoted: msg });
        try {
            // The API might sometimes return NSFW memes, so we add a loop to retry.
            let memeData;
            for (let i = 0; i < 5; i++) { // Try up to 5 times
                const response = await axios.get('https://meme-api.com/gimme');
                if (!response.data.nsfw) {
                    memeData = response.data;
                    break;
                }
            }

            if (!memeData) {
                return await sock.sendMessage(msg.key.remoteJid, { text: 'Could not find a suitable meme. Please try again.' }, { quoted: msg, edit: spinner.key });
            }

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: memeData.url },
                caption: `*${memeData.title}*`
            }, { quoted: msg });
            
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });

        } catch (error) {
            console.error('Meme API Error:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to fetch a meme.' }, { quoted: msg, edit: spinner.key });
        }
    }
};