const { addReminder } = require('../../utils/dbHandler');

module.exports = {
    name: 'remindme',
    category: 'tools',
    description: 'Sets a reminder for the future.',
    emoji: '🔔',
    async execute(sock, msg, args) {
        if (args.length < 3) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: .remindme <time> <unit> <reason>\n*Example:* .remindme 10 minutes Check the oven' });
        }

        const time = parseInt(args[0]);
        const unit = args[1].toLowerCase();
        const reason = args.slice(2).join(' ');

        if (isNaN(time)) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid time value.' });
        }

        let milliseconds;
        switch (unit) {
            case 'second':
            case 'seconds':
                milliseconds = time * 1000;
                break;
            case 'minute':
            case 'minutes':
                milliseconds = time * 60 * 1000;
                break;
            case 'hour':
            case 'hours':
                milliseconds = time * 60 * 60 * 1000;
                break;
            case 'day':
            case 'days':
                milliseconds = time * 24 * 60 * 60 * 1000;
                break;
            default:
                return await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid time unit. Please use seconds, minutes, hours, or days.' });
        }
        
        const dueTime = Date.now() + milliseconds;
        const reminder = {
            userJid: msg.key.remoteJid,
            time: dueTime,
            reason: reason
        };

        addReminder(reminder);

        await sock.sendMessage(msg.key.remoteJid, { text: `Okay, I will remind you in ${time} ${unit}.` }, { quoted: msg });
    }
};