const { getChatSettings, updateChatSettings } = require('../../utils/dbHandler');

module.exports = {
    name: 'unban',
    category: 'admin',
    description: 'Unbans a user, allowing them to rejoin.',
    emoji: '✅',
    async execute(sock, msg, args) {
        const { remoteJid, participant } = msg.key;
        if (!remoteJid.endsWith('@g.us')) return await sock.sendMessage(remoteJid, { text: 'This command is for groups only.' });
        
        const groupMetadata = await sock.groupMetadata(remoteJid);
        const sender = groupMetadata.participants.find(p => p.id === participant);
        const senderIsAdmin = sender && (sender.admin === 'admin' || sender.admin === 'superadmin');
        if (!senderIsAdmin) return await sock.sendMessage(remoteJid, { text: 'You need to be an admin for this.' });

        const targetJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (targetJids.length === 0) return await sock.sendMessage(remoteJid, { text: 'Please mention a user to unban.' });

        const settings = getChatSettings(remoteJid);
        const targetId = targetJids[0];
        const index = settings.bannedUsers.indexOf(targetId);

        if (index > -1) {
            settings.bannedUsers.splice(index, 1);
            updateChatSettings(remoteJid, settings);
            await sock.sendMessage(remoteJid, { text: `User @${targetId.split('@')[0]} has been unbanned.`, mentions: [targetId] });
        } else {
            await sock.sendMessage(remoteJid, { text: 'That user is not on the ban list.' });
        }
    }
};