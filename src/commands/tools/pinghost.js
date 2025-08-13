const ping = require('ping');

module.exports = {
    name: 'pinghost',
    category: 'tools',
    description: 'Pings a network host (server/IP).',
    emoji: '🌐',
    async execute(sock, msg, args) {
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a host or IP to ping. Example: .pinghost 1.1.1.1' }, { quoted: msg });
        }
        
        const host = args[0];
        try {
            const res = await ping.promise.probe(host);
            const pingText = `
*Host Ping Results for ${host}*

› *Status:* ${res.alive ? '🟢 Alive' : '🔴 Unreachable'}
› *Time:* ${res.time} ms
› *IP Address:* ${res.numeric_host}
            `.trim();
            
            await sock.sendMessage(msg.key.remoteJid, { text: pingText }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: `Could not ping host "${host}".` }, { quoted: msg });
        }
    }
};