const axios = require('axios');

module.exports = {
    name: 'shorten',
    category: 'tools',
    description: 'Shortens a long URL.',
    emoji: '🔗',
    async execute(sock, msg, args) {
        if (!args.length || !args[0].startsWith('http')) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a valid URL to shorten.' }, { quoted: msg });
        }
        
        const longUrl = args[0];
        const apiUrl = `http://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;

        try {
            const response = await axios.get(apiUrl);
            await sock.sendMessage(msg.key.remoteJid, { text: `*Shortened URL:*\n${response.data}` }, { quoted: msg });
        } catch (error) {
            console.error('URL Shorten error:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to shorten the URL.' }, { quoted: msg });
        }
    }
};