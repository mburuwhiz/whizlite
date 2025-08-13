module.exports = {
    name: 'grouplock',
    category: 'admin',
    description: 'Allows only admins to send messages in the group.',
    emoji: '🔒',
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

        try {
            await sock.groupSettingUpdate(remoteJid, 'announcement');
        } catch (e) {
            console.error(e);
            await sock.sendMessage(remoteJid, { text: 'An error occurred.' }, { quoted: msg });
        }
    }
};