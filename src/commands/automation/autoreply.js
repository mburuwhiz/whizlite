const { getChatSettings, updateChatSettings } = require('../../utils/dbHandler');
const config = require('../../config');

module.exports = {
    name: 'autoreply',
    category: 'automation',
    description: 'Manages auto-reply when the bot is mentioned.',
    emoji: '🤖',
    async execute(sock, msg, args) {
        if (!config.ENABLE_AUTOREPLY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The auto-reply feature is disabled by the bot owner.' });
        }
        const { remoteJid, participant } = msg.key;
        if (!remoteJid.endsWith('@g.us')) return await sock.sendMessage(remoteJid, { text: 'This command is for groups only.' });
        
        const groupMetadata = await sock.groupMetadata(remoteJid);
        const sender = groupMetadata.participants.find(p => p.id === participant);
        if (!sender?.admin) return await sock.sendMessage(remoteJid, { text: 'You need to be an admin to use this command.' });

        const subCommand = args[0]?.toLowerCase();
        const settings = getChatSettings(remoteJid);

        if (subCommand === 'on') {
            settings.autoreply.enabled = true;
            updateChatSettings(remoteJid, settings);
            await sock.sendMessage(remoteJid, { text: 'Auto-reply on mention is now *ON*.' });
        } else if (subCommand === 'off') {
            settings.autoreply.enabled = false;
            updateChatSettings(remoteJid, settings);
            await sock.sendMessage(remoteJid, { text: 'Auto-reply on mention is now *OFF*.' });
        } else if (subCommand === 'set') {
            const message = args.slice(1).join(' ');
            if (!message) return await sock.sendMessage(remoteJid, { text: 'Please provide a message to set for auto-reply.' });
            settings.autoreply.message = message;
            updateChatSettings(remoteJid, settings);
            await sock.sendMessage(remoteJid, { text: 'Auto-reply message has been updated.' });
        } else {
            await sock.sendMessage(remoteJid, { text: 'Usage: .autoreply <on|off|set message>' });
        }
    }
};