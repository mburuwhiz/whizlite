module.exports = {
    name: 'kick',
    category: 'admin',
    description: 'Removes a user from the group.',
    emoji: '👢',
    async execute(sock, msg, args) {
        const { remoteJid, participant } = msg.key;
        if (!remoteJid.endsWith('@g.us')) {
            return await sock.sendMessage(remoteJid, { text: 'This command can only be used in groups.' }, { quoted: msg });
        }

        const groupMetadata = await sock.groupMetadata(remoteJid);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        const bot = groupMetadata.participants.find(p => p.id === botId);
        const sender = groupMetadata.participants.find(p => p.id === participant);

        const botIsAdmin = bot && (bot.admin === 'admin' || bot.admin === 'superadmin');
        const senderIsAdmin = sender && (sender.admin === 'admin' || sender.admin === 'superadmin');

        if (!botIsAdmin) {
            return await sock.sendMessage(remoteJid, { text: 'I need to be an admin to use this command.' }, { quoted: msg });
        }
        if (!senderIsAdmin) {
            return await sock.sendMessage(remoteJid, { text: 'You need to be an admin to use this command.' }, { quoted: msg });
        }

        const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
        const targetJids = mentionedJids.length > 0 ? mentionedJids : quotedParticipant ? [quotedParticipant] : [];

        if (targetJids.length === 0) {
            return await sock.sendMessage(remoteJid, { text: 'Please mention a user or reply to their message to kick.' }, { quoted: msg });
        }
        
        // Prevent kicking the bot or the owner
        if (targetJids.includes(botId) || targetJids.includes(groupMetadata.owner)) {
            return await sock.sendMessage(remoteJid, { text: 'I cannot kick myself or the group owner.' }, { quoted: msg });
        }

        try {
            await sock.groupParticipantsUpdate(remoteJid, targetJids, 'remove');
        } catch (e) {
            console.error('Kick command error:', e);
            await sock.sendMessage(remoteJid, { text: 'Failed to kick the user. They might be an admin or the group owner.' }, { quoted: msg });
        }
    }
};