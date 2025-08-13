const config = require('../config');

const recentStatuses = new Map();
const reactionEmojis = ['👍', '❤️', '🔥', '😮', '😂', '👏', '💯', '🙌'];

const handleStatusUpdate = async (sock, msg) => {
    if (msg.key.participant) {
        recentStatuses.set(msg.key.participant, msg);
    }
    
    if (config.AUTO_VIEW_STATUS) {
        await sock.readMessages([msg.key]);
    }

    if (config.AUTO_LIKE_STATUS) {
        try {
            const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
            await sock.sendMessage('status@broadcast', {
                react: {
                    text: randomEmoji,
                    key: msg.key
                }
            });
        } catch (e) {
            console.error("Failed to react to status:", e);
        }
    }
};

module.exports = { handleStatusUpdate, recentStatuses };