const { getChatSettings, updateChatSettings } = require('../../utils/dbHandler');
const config = require('../../config');

module.exports = {
    name: 'welcome',
    category: 'automation',
    description: 'Manages automated welcome messages for new members.',
    emoji: '👋',
    async execute(sock, msg, args) {
        if (!config.ENABLE_WELCOME_GOODBYE) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The welcome/goodbye feature is disabled by the bot owner.' });
        }
        const { remoteJid, participant } = msg.key;
        if (!remoteJid.endsWith('@g.us')) return await sock.sendMessage(remoteJid, { text: 'This command is for groups only.' });
        
        const groupMetadata = await sock.groupMetadata(remoteJid);
        const sender = groupMetadata.participants.find(p => p.id === participant);
        if (!sender?.admin) return await sock.sendMessage(remoteJid, { text: 'You need to be an admin to use this command.' });

        const subCommand = args[0]?.toLowerCase();
        const settings = getChatSettings(remoteJid);

        if (subCommand === 'on') {
            settings.welcome.enabled = true;
            updateChatSettings(remoteJid, settings);
            await sock.sendMessage(remoteJid, { text: 'Welcome messages are now *ON* for this group.' });
        } else if (subCommand === 'off') {
            settings.welcome.enabled = false;
            updateChatSettings(remoteJid, settings);
            await sock.sendMessage(remoteJid, { text: 'Welcome messages are now *OFF* for this group.' });
        } else if (subCommand === 'set') {
            const message = args.slice(1).join(' ');
            if (!message) return await sock.sendMessage(remoteJid, { text: 'Please provide a welcome message. Use `@user` for mention and `{group_name}` for the group name.' });
            settings.welcome.message = message;
            updateChatSettings(remoteJid, settings);
            await sock.sendMessage(remoteJid, { text: 'Welcome message has been updated.' });
        } else {
            await sock.sendMessage(remoteJid, { text: 'Usage: .welcome <on|off|set message>' });
        }
    }
};