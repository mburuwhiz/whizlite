const axios = require('axios');

module.exports = {
    name: 'instadl',
    category: 'media',
    description: 'Downloads a video or image from an Instagram post.',
    emoji: '📸',
    async execute(sock, msg, args) {
        if (!args.length || !args[0].includes('instagram.com')) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a valid Instagram post URL.' }, { quoted: msg });
        }

        const url = args[0];
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Fetching media from Instagram... ⏳' }, { quoted: msg });

        try {
            // We use a public third-party API to bypass Instagram's restrictions
            const apiUrl = `https://api.popcat.xyz/instagram?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);

            if (response.data.error) {
                throw new Error(response.data.error);
            }

            const mediaUrl = response.data.media;
            const isVideo = mediaUrl.includes('.mp4');

            if (isVideo) {
                await sock.sendMessage(msg.key.remoteJid, {
                    video: { url: mediaUrl },
                    caption: 'Here is your Instagram video!'
                }, { quoted: msg });
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    image: { url: mediaUrl },
                    caption: 'Here is your Instagram image!'
                }, { quoted: msg });
            }

            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        } catch (e) {
            console.error('InstaDL Error:', e.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to download the media. The post might be private, deleted, or the API service may be down.' }, { quoted: msg, edit: spinner.key });
        }
    }
};