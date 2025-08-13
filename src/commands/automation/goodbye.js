const { getChatSettings, updateChatSettings } = require('../../utils/dbHandler');
const config = require('../../config');

module.exports = {
    name: 'goodbye',
    category: 'automation',
    description: 'Manages automated goodbye messages.',
    emoji: '🚪',
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
            settings.goodbye.enabled = true;
            updateChatSettings(remoteJid, settings);
            await sock.sendMessage(remoteJid, { text: 'Goodbye messages are now *ON*.' });
        } else if (subCommand === 'off') {
            settings.goodbye.enabled = false;
            updateChatSettings(remoteJid, settings);
            await sock.sendMessage(remoteJid, { text: 'Goodbye messages are now *OFF*.' });
        } else if (subCommand === 'set') {
            const message = args.slice(1).join(' ');
            if (!message) return await sock.sendMessage(remoteJid, { text: 'Please provide a goodbye message. Use `@user` and `{group_name}`.' });
            settings.goodbye.message = message;
            updateChatSettings(remoteJid, settings);
            await sock.sendMessage(remoteJid, { text: 'Goodbye message has been updated.' });
        } else {
            await sock.sendMessage(remoteJid, { text: 'Usage: .goodbye <on|off|set message>' });
        }
    }
};