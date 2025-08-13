const config = require('../../config');

module.exports = {
    name: 'help',
    category: 'user',
    description: 'Provides details about commands.',
    emoji: '❓',
    // The signature now accepts the 'commands' map
    async execute(sock, msg, args, commands) {
        if (!args.length) {
            let helpText = `╭━•─•── ✦ *WHIZLITE HELP* •─•─•━╮\n\nHello *${msg.pushName}*!\nI am WHIZLITE, your multi-purpose WhatsApp assistant.\n\n`;
            helpText += `Use *${config.PREFIX}menu* to see all commands.\n`;
            helpText += `Use *${config.PREFIX}help <command_name>* to get info on a specific command.\n\n`;
            helpText += `*Example:* ${config.PREFIX}help sticker`;
            helpText += `\n╰━•─•──—•─•─•━╯`;
            await sock.sendMessage(msg.key.remoteJid, { text: helpText }, { quoted: msg });
            return;
        }

        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName);

        if (!command) {
            return await sock.sendMessage(msg.key.remoteJid, { text: `Command not found: *${commandName}*` }, { quoted: msg });
        }

        const specificHelpText = `╭━•─•── ✦ *HELP* •─•─•━╮\n┃ \n┃ • *Command:* \`${command.name}\`\n┃ • *Category:* ${command.category}\n┃ • *Description:* ${command.description}\n┃ \n╰━•─•──—•─•─•━╯`.trim();
        await sock.sendMessage(msg.key.remoteJid, { text: specificHelpText }, { quoted: msg });
    }
};