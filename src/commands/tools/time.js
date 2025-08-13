const { DateTime } = require('luxon');

module.exports = {
    name: 'time',
    category: 'tools',
    description: 'Gets the current time for a specified timezone.',
    emoji: '⏰',
    async execute(sock, msg, args) {
        if (!args.length) {
            // Default to server time
            const now = DateTime.now();
            const timeString = now.toFormat('hh:mm:ss a, cccc, LLLL d, yyyy');
            return await sock.sendMessage(msg.key.remoteJid, { text: `*Server Time:* \n${timeString}` }, { quoted: msg });
        }
        
        const timezone = args.join('_');
        try {
            const now = DateTime.now().setZone(timezone);
            if (!now.isValid) {
                throw new Error('Invalid timezone');
            }
            const timeString = now.toFormat('hh:mm:ss a, cccc, LLLL d, yyyy');
            await sock.sendMessage(msg.key.remoteJid, { text: `*Time in ${timezone.replace('_', ' ')}:* \n${timeString}` }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid timezone. Please use a valid format like "Africa/Nairobi" or "America/New_York".' }, { quoted: msg });
        }
    }
};