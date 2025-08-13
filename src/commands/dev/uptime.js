const { formatUptime } = require('../../utils/functions');

module.exports = {
    name: 'uptime',
    category: 'dev',
    description: 'Shows how long the bot has been running.',
    emoji: '⏳',
    async execute(sock, msg, args) {
        const uptime = process.uptime();
        const formattedUptime = formatUptime(uptime);
        await sock.sendMessage(msg.key.remoteJid, { text: `*Uptime:* ${formattedUptime}` }, { quoted: msg });
    }
};