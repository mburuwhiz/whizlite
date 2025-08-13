const dns = require('dns').promises;

module.exports = {
    name: 'dns',
    category: 'tools',
    description: 'Performs a DNS lookup for a domain.',
    emoji: '🔍',
    async execute(sock, msg, args) {
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a domain to look up. Example: .dns whatsapp.com' }, { quoted: msg });
        }
        
        const domain = args[0];
        try {
            const [ipv4, ipv6, mx] = await Promise.all([
                dns.resolve4(domain).catch(() => ['Not found']),
                dns.resolve6(domain).catch(() => ['Not found']),
                dns.resolveMx(domain).catch(() => [])
            ]);

            let dnsText = `*DNS Records for ${domain}*\n\n`;
            dnsText += `*A (IPv4):*\n${ipv4.join('\n')}\n\n`;
            dnsText += `*AAAA (IPv6):*\n${ipv6.join('\n')}\n\n`;
            dnsText += `*MX (Mail):*\n${mx.map(record => `${record.priority} ${record.exchange}`).join('\n') || 'Not found'}`;

            await sock.sendMessage(msg.key.remoteJid, { text: dnsText.trim() }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: `Could not perform DNS lookup for "${domain}".` }, { quoted: msg });
        }
    }
};