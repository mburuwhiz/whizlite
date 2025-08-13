const config = require('../../config');

module.exports = {
    name: 'reload',
    category: 'dev',
    description: 'Reloads a specific command file. (Owner only)',
    emoji: '🔩',
    // The signature now accepts the 'commands' map
    async execute(sock, msg, args, commands) {
        if (msg.key.remoteJid.split('@')[0] !== config.OWNER_NUMBER) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'This is an owner-only command.' }, { quoted: msg });
        }
        if (!args.length) return await sock.sendMessage(msg.key.remoteJid, { text: 'Please specify a command to reload.' });
        
        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName);

        if (!command) return await sock.sendMessage(msg.key.remoteJid, { text: `Command ".${commandName}" not found.` });

        const filePath = require.resolve(`../${command.category}/${command.name}.js`);
        
        try {
            delete require.cache[filePath];
            const newCommand = require(filePath);
            commands.set(newCommand.name, newCommand);
            await sock.sendMessage(msg.key.remoteJid, { text: `Successfully reloaded the ".${commandName}" command.` });
        } catch (e) {
            console.error('Reload error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: `Failed to reload ".${commandName}".` });
        }
    }
};