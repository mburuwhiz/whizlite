const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'image',
    category: 'search',
    description: 'Searches for a real image on the web.',
    emoji: '🖼️',
    async execute(sock, msg, args) {
        if (!config.PEXELS_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The Pexels API key is not set. This command is disabled.' }, { quoted: msg });
        }
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a search term. Example: .image Nairobi sunset' }, { quoted: msg });
        }

        const query = args.join(' ');
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: `Searching for images of *${query}*...` }, { quoted: msg });

        try {
            const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15`;
            const response = await axios.get(url, {
                headers: { 'Authorization': config.PEXELS_API_KEY }
            });

            if (response.data.photos.length === 0) {
                return await sock.sendMessage(msg.key.remoteJid, { text: `No images found for *${query}*.` }, { quoted: msg });
            }

            const randomPhoto = response.data.photos[Math.floor(Math.random() * response.data.photos.length)];

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: randomPhoto.src.large },
                caption: `Here is an image of *${query}*.\nPhoto by *${randomPhoto.photographer}* on Pexels.`
            }, { quoted: msg });

            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        } catch (e) {
            console.error('Pexels API Error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ An error occurred while searching for images.' }, { quoted: msg });
            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        }
    }
};