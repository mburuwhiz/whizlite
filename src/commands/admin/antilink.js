const { getChatSettings, updateChatSettings } = require('../../utils/dbHandler');

module.exports = {
    name: 'antilink',
    category: 'admin',
    description: 'Enables or disables the anti-link feature in the group.',
    emoji: '🔗',
    async execute(sock, msg, args) {
        const { remoteJid, participant } = msg.key;
        if (!remoteJid.endsWith('@g.us')) return await sock.sendMessage(remoteJid, { text: 'This command is for groups only.' });

        const groupMetadata = await sock.groupMetadata(remoteJid);
        const sender = groupMetadata.participants.find(p => p.id === participant);
        const senderIsAdmin = sender && (sender.admin === 'admin' || sender.admin === 'superadmin');

        if (!senderIsAdmin) return await sock.sendMessage(remoteJid, { text: 'You need to be an admin to use this command.' });
        
        const option = args[0]?.toLowerCase();
        if (option !== 'on' && option !== 'off') {
            return await sock.sendMessage(remoteJid, { text: 'Usage: .antilink <on|off>' });
        }
        
        const settings = getChatSettings(remoteJid);
        settings.antilink = option === 'on';
        updateChatSettings(remoteJid, settings);
        
        await sock.sendMessage(remoteJid, { text: `Anti-link feature has been turned *${option.toUpperCase()}*.` });
    }
};