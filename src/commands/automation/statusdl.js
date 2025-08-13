const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { recentStatuses } = require('../../handlers/statusHandler');

module.exports = {
    name: 'statusdl',
    category: 'automation',
    description: 'Downloads the most recent status from a mentioned user.',
    emoji: '📥',
    async execute(sock, msg, args) {
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedJid) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please mention the user whose status you want to download. Example: .statusdl @user' }, { quoted: msg });
        }

        const statusMsg = recentStatuses.get(mentionedJid);
        if (!statusMsg) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'I have not seen a recent status from that user. They need to post a new one while I am running.' }, { quoted: msg });
        }
        
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Downloading status... ⏳' }, { quoted: msg });

        try {
            const buffer = await downloadMediaMessage(statusMsg, 'buffer', {});
            const isVideo = !!statusMsg.message.videoMessage;
            const caption = statusMsg.message.videoMessage?.caption || statusMsg.message.imageMessage?.caption || '';

            if (isVideo) {
                await sock.sendMessage(msg.key.remoteJid, { video: buffer, caption: caption || 'Here is the status video!' }, { quoted: msg });
            } else {
                await sock.sendMessage(msg.key.remoteJid, { image: buffer, caption: caption || 'Here is the status image!' }, { quoted: msg });
            }

            await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
        } catch (e) {
            console.error('StatusDL Error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ An error occurred while downloading the status.' }, { quoted: msg, edit: spinner.key });
        }
    }
};