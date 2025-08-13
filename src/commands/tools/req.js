const axios = require('axios');

module.exports = {
    name: 'req',
    category: 'tools',
    description: 'Performs an HTTP GET request to a URL.',
    emoji: '📤',
    async execute(sock, msg, args) {
        if (!args.length || !args[0].startsWith('http')) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a valid URL. Example: .req https://api.github.com' }, { quoted: msg });
        }
        
        const url = args[0];
        try {
            const response = await axios.get(url);
            
            let headersText = '';
            for (const key in response.headers) {
                headersText += `*${key}:* ${response.headers[key]}\n`;
            }

            const responseText = `
*HTTP Request to ${url}*

*Status:* ${response.status} ${response.statusText}

*Headers:*
\`\`\`${headersText.substring(0, 500)}...\`\`\`

*Response Body (first 500 chars):*
\`\`\`${JSON.stringify(response.data, null, 2).substring(0, 500)}...\`\`\`
            `.trim();
            
            await sock.sendMessage(msg.key.remoteJid, { text: responseText }, { quoted: msg });
        } catch (error) {
            let errorText = `Failed to fetch URL: ${url}\n`;
            if (error.response) {
                errorText += `*Status:* ${error.response.status} ${error.response.statusText}`;
            } else {
                errorText += `*Error:* ${error.message}`;
            }
            await sock.sendMessage(msg.key.remoteJid, { text: errorText }, { quoted: msg });
        }
    }
};