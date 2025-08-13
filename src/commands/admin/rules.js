const { getChatSettings } = require('../../utils/dbHandler');

module.exports = {
    name: 'rules',
    category: 'admin',
    description: 'Displays the group rules.',
    emoji: '📜',
    async execute(sock, msg, args) {
        const { remoteJid } = msg.key;
        if (!remoteJid.endsWith('@g.us')) return await sock.sendMessage(remoteJid, { text: 'This command is for groups only.' });
        
        const settings = getChatSettings(remoteJid);
        await sock.sendMessage(remoteJid, { text: `*Group Rules:*\n\n${settings.rules}` });
    }
};