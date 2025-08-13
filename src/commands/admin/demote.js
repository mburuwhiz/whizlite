module.exports = {
    name: 'demote',
    category: 'admin',
    description: 'Demotes an admin to a regular user.',
    emoji: '⬇️',
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

        if (!botIsAdmin) return await sock.sendMessage(remoteJid, { text: 'I need to be an admin for this.' }, { quoted: msg });
        if (!senderIsAdmin) return await sock.sendMessage(remoteJid, { text: 'You need to be an admin for this.' }, { quoted: msg });

        const targetJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || (msg.message?.extendedTextMessage?.contextInfo?.participant ? [msg.message.extendedTextMessage.contextInfo.participant] : []);
        if (targetJids.length === 0) {
            return await sock.sendMessage(remoteJid, { text: 'Please mention a user or reply to their message to demote.' }, { quoted: msg });
        }

        try {
            await sock.groupParticipantsUpdate(remoteJid, targetJids, 'demote');
        } catch (e) {
            console.error(e);
            await sock.sendMessage(remoteJid, { text: 'An error occurred.' }, { quoted: msg });
        }
    }
};