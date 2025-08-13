const config = require('../../config');

module.exports = {
    name: 'feedback',
    category: 'tools',
    description: 'Send feedback directly to the bot owner.',
    emoji: '✉️',
    async execute(sock, msg, args) {
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide your feedback after the command.' }, { quoted: msg });
        }

        const feedback = args.join(' ');
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const senderName = msg.pushName || 'A user';

        const feedbackMessage = `
*📬 New Feedback Received!*

*From:* ${senderName} (@${senderJid.split('@')[0]})
*Message:*
${feedback}
        `.trim();

        try {
            await sock.sendMessage(config.OWNER_NUMBER + '@s.whatsapp.net', { text: feedbackMessage, mentions: [senderJid] });
            await sock.sendMessage(msg.key.remoteJid, { text: 'Thank you! Your feedback has been sent to the owner.' }, { quoted: msg });
        } catch (e) {
            console.error('Feedback sending error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Sorry, I could not send your feedback at this time.' }, { quoted: msg });
        }
    }
};