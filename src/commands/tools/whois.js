const whois = require('whois');

// Wrap whois.lookup in a Promise
const whoisLookup = (domain) => {
    return new Promise((resolve, reject) => {
        whois.lookup(domain, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

module.exports = {
    name: 'whois',
    category: 'tools',
    description: 'Gets WHOIS information for a domain.',
    emoji: '📓',
    async execute(sock, msg, args) {
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a domain name. Example: .whois github.com' }, { quoted: msg });
        }
        
        const domain = args[0];
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: `Searching WHOIS records for *${domain}*...` }, { quoted: msg });
        
        try {
            const data = await whoisLookup(domain);
            await sock.sendMessage(msg.key.remoteJid, { text: '```' + data + '```', edit: spinner.key });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: `Could not retrieve WHOIS data for "${domain}".`, edit: spinner.key });
        }
    }
};