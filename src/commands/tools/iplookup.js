const axios = require('axios');

module.exports = {
    name: 'iplookup',
    category: 'tools',
    description: 'Get information about an IP address or domain.',
    emoji: '📡',
    async execute(sock, msg, args) {
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide an IP address or domain. Example: .iplookup google.com' }, { quoted: msg });
        }
        
        const query = args[0];
        try {
            const response = await axios.get(`http://ip-api.com/json/${query}`);
            const data = response.data;

            if (data.status === 'fail') {
                throw new Error('Failed to retrieve information.');
            }

            const infoText = `
*IP Lookup Results for "${data.query}"*

› *Country:* ${data.country} (${data.countryCode})
› *Region:* ${data.regionName}
› *City:* ${data.city}
› *ZIP Code:* ${data.zip}
› *ISP:* ${data.isp}
› *Organization:* ${data.org}
› *ASN:* ${data.as}
            `.trim();

            await sock.sendMessage(msg.key.remoteJid, { text: infoText }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: `Could not find information for "${query}". Please provide a valid public IP or domain.` }, { quoted: msg });
        }
    }
};