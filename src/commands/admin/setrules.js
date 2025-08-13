const { getChatSettings, updateChatSettings } = require('../../utils/dbHandler');

module.exports = {
    name: 'setrules',
    category: 'admin',
    description: 'Sets the rules for the group.',
    emoji: '✍️',
    async execute(sock, msg, args) {
        const { remoteJid, participant } = msg.key;
        if (!remoteJid.endsWith('@g.us')) return await sock.sendMessage(remoteJid, { text: 'This command is for groups only.' });

        const groupMetadata = await sock.groupMetadata(remoteJid);
        const sender = groupMetadata.participants.find(p => p.id === participant);
        const senderIsAdmin = sender && (sender.admin === 'admin' || sender.admin === 'superadmin');
        if (!senderIsAdmin) return await sock.sendMessage(remoteJid, { text: 'You need to be an admin to use this command.' });

        const newRules = args.join(' ');
        if (!newRules) return await sock.sendMessage(remoteJid, { text: 'Please provide the rules text after the command.' });
        
        const settings = getChatSettings(remoteJid);
        settings.rules = newRules;
        updateChatSettings(remoteJid, settings);

        await sock.sendMessage(remoteJid, { text: 'Group rules have been updated successfully.' });
    }
};