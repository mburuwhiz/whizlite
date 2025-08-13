const { readDb } = require('../../utils/dbHandler');
const config = require('../../config');

module.exports = {
    name: 'analytics',
    category: 'dev',
    description: 'Displays bot usage statistics. (Owner only)',
    emoji: '📈',
    async execute(sock, msg, args) {
        if (msg.key.remoteJid.split('@')[0] !== config.OWNER_NUMBER) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'This is an owner-only command.' }, { quoted: msg });
        }

        const db = readDb();
        const stats = db.commandStats;

        if (Object.keys(stats).length === 0) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'No command usage has been recorded yet.' }, { quoted: msg });
        }

        const sortedStats = Object.entries(stats).sort(([,a],[,b]) => b-a);
        
        let analyticsText = '*WHIZLITE Command Analytics*\n\n';
        let totalCommands = 0;
        
        sortedStats.forEach(([command, count]) => {
            analyticsText += `› *.${command}*: ${count} times\n`;
            totalCommands += count;
        });

        analyticsText += `\n*Total Commands Used:* ${totalCommands}`;

        await sock.sendMessage(msg.key.remoteJid, { text: analyticsText }, { quoted: msg });
    }
};