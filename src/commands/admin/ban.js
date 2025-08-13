const { getChatSettings, updateChatSettings } = require('../../utils/dbHandler');

module.exports = {
    name: 'ban',
    category: 'admin',
    description: 'Bans a user, kicking them and preventing re-entry.',
    emoji: '🚫',
    async execute(sock, msg, args) {
        const { remoteJid, participant } = msg.key;
        if (!remoteJid.endsWith('@g.us')) return await sock.sendMessage(remoteJid, { text: 'This command is for groups only.' });

        const groupMetadata = await sock.groupMetadata(remoteJid);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const bot = groupMetadata.participants.find(p => p.id === botId);
        const sender = groupMetadata.participants.find(p => p.id === participant);
        const botIsAdmin = bot && (bot.admin === 'admin' || bot.admin === 'superadmin');
        const senderIsAdmin = sender && (sender.admin === 'admin' || sender.admin === 'superadmin');

        if (!botIsAdmin) return await sock.sendMessage(remoteJid, { text: 'I need to be an admin for this.' });
        if (!senderIsAdmin) return await sock.sendMessage(remoteJid, { text: 'You need to be an admin for this.' });

        const targetJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || (msg.message?.extendedTextMessage?.contextInfo?.participant ? [msg.message.extendedTextMessage.contextInfo.participant] : []);
        if (targetJids.length === 0) return await sock.sendMessage(remoteJid, { text: 'Please mention a user or reply to their message to ban.' });

        const settings = getChatSettings(remoteJid);
        const targetId = targetJids[0];
        
        if (targetId === botId || targetId === groupMetadata.owner) {
             return await sock.sendMessage(remoteJid, { text: 'I cannot ban myself or the group owner.' });
        }

        if (!settings.bannedUsers.includes(targetId)) {
            settings.bannedUsers.push(targetId);
            updateChatSettings(remoteJid, settings);
        }
        
        try {
            await sock.sendMessage(remoteJid, { text: `User @${targetId.split('@')[0]} has been banned.`, mentions: [targetId] });
            await sock.groupParticipantsUpdate(remoteJid, [targetId], 'remove');
        } catch (e) {
            await sock.sendMessage(remoteJid, { text: 'Failed to kick the user, but they have been added to the ban list.' });
        }
    }
};