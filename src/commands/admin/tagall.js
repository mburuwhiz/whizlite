module.exports = {
    name: 'tagall',
    category: 'admin',
    description: 'Mentions all members in a group.',
    emoji: '📢',
    async execute(sock, msg, args) {
        const { remoteJid } = msg.key;
        if (!remoteJid.endsWith('@g.us')) {
            return await sock.sendMessage(remoteJid, { text: 'This command can only be used in groups.' }, { quoted: msg });
        }

        const groupMetadata = await sock.groupMetadata(remoteJid);
        const participants = groupMetadata.participants;

        let text = args.length > 0 ? args.join(' ') + '\n\n' : 'Attention Everyone!\n\n';
        let mentions = [];

        for (let participant of participants) {
            text += `⦿ @${participant.id.split('@')[0]}\n`;
            mentions.push(participant.id);
        }

        await sock.sendMessage(remoteJid, { text, mentions });
    }
};