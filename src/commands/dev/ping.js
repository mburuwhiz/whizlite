module.exports = {
    name: 'ping',
    category: 'dev',
    description: 'Checks the bot\'s responsiveness.',
    emoji: '🏓',
    async execute(sock, msg, args) {
        const startTime = Date.now();
        await sock.sendMessage(msg.key.remoteJid, { text: 'Pinging...' }, { quoted: msg });
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        await sock.sendMessage(msg.key.remoteJid, { text: `*Pong!*\nLatency: ${latency} ms` }, { quoted: msg });
    }
};