const { getChatSettings, updateChatSettings } = require('../../utils/dbHandler');
const config = require('../../config');

module.exports = {
    name: 'autoreact',
    category: 'automation',
    description: 'Manages automated reactions to keywords.',
    emoji: '👍',
    async execute(sock, msg, args) {
        if (!config.ENABLE_AUTOREACT) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The auto-react feature is disabled by the bot owner.' });
        }
        const { remoteJid, participant } = msg.key;
        if (!remoteJid.endsWith('@g.us')) return await sock.sendMessage(remoteJid, { text: 'This command is for groups only.' });
        
        const groupMetadata = await sock.groupMetadata(remoteJid);
        const sender = groupMetadata.participants.find(p => p.id === participant);
        if (!sender?.admin) return await sock.sendMessage(remoteJid, { text: 'You need to be an admin to use this command.' });

        const subCommand = args[0]?.toLowerCase();
        const settings = getChatSettings(remoteJid);

        switch(subCommand) {
            case 'on':
                settings.autoreact.enabled = true;
                updateChatSettings(remoteJid, settings);
                await sock.sendMessage(remoteJid, { text: 'Auto-react is now *ON*.' });
                break;
            case 'off':
                settings.autoreact.enabled = false;
                updateChatSettings(remoteJid, settings);
                await sock.sendMessage(remoteJid, { text: 'Auto-react is now *OFF*.' });
                break;
            case 'add':
                const keyword = args[1]?.toLowerCase();
                const emoji = args[2];
                if (!keyword || !emoji) return await sock.sendMessage(remoteJid, { text: 'Usage: .autoreact add <keyword> <emoji>' });
                settings.autoreact.reactions[keyword] = emoji;
                updateChatSettings(remoteJid, settings);
                await sock.sendMessage(remoteJid, { text: `Now reacting with ${emoji} to the word "${keyword}".` });
                break;
            case 'remove':
                const wordToRemove = args[1]?.toLowerCase();
                if (!wordToRemove) return await sock.sendMessage(remoteJid, { text: 'Usage: .autoreact remove <keyword>' });
                if (settings.autoreact.reactions[wordToRemove]) {
                    delete settings.autoreact.reactions[wordToRemove];
                    updateChatSettings(remoteJid, settings);
                    await sock.sendMessage(remoteJid, { text: `No longer reacting to the word "${wordToRemove}".` });
                } else {
                    await sock.sendMessage(remoteJid, { text: `The keyword "${wordToRemove}" was not found.` });
                }
                break;
            case 'list':
                const reactions = settings.autoreact.reactions;
                let list = '*Auto-React List:*\n\n';
                if (Object.keys(reactions).length === 0) {
                    list = 'No auto-reactions have been set.';
                } else {
                    for (const key in reactions) {
                        list += `• "${key}" → ${reactions[key]}\n`;
                    }
                }
                await sock.sendMessage(remoteJid, { text: list });
                break;
            default:
                await sock.sendMessage(remoteJid, { text: 'Usage: .autoreact <on|off|add|remove|list>' });
        }
    }
};