const { getChatSettings, updateChatSettings } = require('../../utils/dbHandler');

module.exports = {
    name: 'antiword',
    category: 'admin',
    description: 'Manages forbidden words in the group.',
    emoji: '🤬',
    async execute(sock, msg, args) {
        const { remoteJid, participant } = msg.key;
        if (!remoteJid.endsWith('@g.us')) return await sock.sendMessage(remoteJid, { text: 'This command is for groups only.' });

        const groupMetadata = await sock.groupMetadata(remoteJid);
        const sender = groupMetadata.participants.find(p => p.id === participant);
        const senderIsAdmin = sender && (sender.admin === 'admin' || sender.admin === 'superadmin');
        if (!senderIsAdmin) return await sock.sendMessage(remoteJid, { text: 'You need to be an admin to use this command.' });

        const subCommand = args[0]?.toLowerCase();
        const word = args[1]?.toLowerCase();
        const settings = getChatSettings(remoteJid);

        switch (subCommand) {
            case 'on':
                settings.antiword.enabled = true;
                updateChatSettings(remoteJid, settings);
                await sock.sendMessage(remoteJid, { text: 'Anti-word feature turned *ON*.' });
                break;
            case 'off':
                settings.antiword.enabled = false;
                updateChatSettings(remoteJid, settings);
                await sock.sendMessage(remoteJid, { text: 'Anti-word feature turned *OFF*.' });
                break;
            case 'add':
                if (!word) return await sock.sendMessage(remoteJid, { text: 'Usage: .antiword add <word>' });
                if (!settings.antiword.words.includes(word)) {
                    settings.antiword.words.push(word);
                    updateChatSettings(remoteJid, settings);
                    await sock.sendMessage(remoteJid, { text: `"${word}" has been added to the forbidden list.` });
                } else {
                    await sock.sendMessage(remoteJid, { text: `"${word}" is already on the list.` });
                }
                break;
            case 'remove':
                if (!word) return await sock.sendMessage(remoteJid, { text: 'Usage: .antiword remove <word>' });
                const index = settings.antiword.words.indexOf(word);
                if (index > -1) {
                    settings.antiword.words.splice(index, 1);
                    updateChatSettings(remoteJid, settings);
                    await sock.sendMessage(remoteJid, { text: `"${word}" has been removed from the forbidden list.` });
                } else {
                    await sock.sendMessage(remoteJid, { text: `"${word}" is not on the list.` });
                }
                break;
            case 'list':
                const wordList = settings.antiword.words.join(', ');
                await sock.sendMessage(remoteJid, { text: `*Forbidden Words:* \n${wordList || 'No words have been set.'}` });
                break;
            default:
                await sock.sendMessage(remoteJid, { text: 'Usage: .antiword <on|off|add|remove|list>' });
        }
    }
};