const os = require('os');
const { formatUptime, formatBytes } = require('../../utils/functions');

module.exports = {
    name: 'status',
    category: 'dev',
    description: 'Displays the bot\'s and server\'s status.',
    emoji: '📊',
    async execute(sock, msg, args) {
        const uptime = process.uptime();
        const ramUsage = process.memoryUsage();
        const totalRam = os.totalmem();
        const freeRam = os.freemem();

        const statusText = `
*🤖 WHIZLITE STATUS 🤖*

*Bot Stats:*
› *Uptime:* ${formatUptime(uptime)}
› *RAM Usage:* ${formatBytes(ramUsage.rss)}

*Server Stats:*
› *Platform:* ${os.platform()}
› *CPU Model:* ${os.cpus()[0].model}
› *Total RAM:* ${formatBytes(totalRam)}
› *Free RAM:* ${formatBytes(freeRam)}
        `;

        await sock.sendMessage(msg.key.remoteJid, { text: statusText.trim() }, { quoted: msg });
    }
};