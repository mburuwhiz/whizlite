const { getChatSettings } = require('../../utils/dbHandler');

module.exports = {
    name: 'banlist',
    category: 'admin',
    description: 'Shows the list of banned users.',
    emoji: '📋',
    async execute(sock, msg, args) {
        const { remoteJid } = msg.key;
        if (!remoteJid.endsWith('@g.us')) return await sock.sendMessage(remoteJid, { text: 'This command is for groups only.' });

        const settings = getChatSettings(remoteJid);
        if (settings.bannedUsers.length === 0) {
            return await sock.sendMessage(remoteJid, { text: 'The ban list is empty.' });
        }
        
        let banListText = '*Banned Users:*\n\n';
        let mentions = [];
        settings.bannedUsers.forEach(jid => {
            banListText += `• @${jid.split('@')[0]}\n`;
            mentions.push(jid);
        });

        await sock.sendMessage(remoteJid, { text: banListText.trim(), mentions });
    }
};