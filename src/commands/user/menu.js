const os = require('os');
const { formatUptime, formatBytes } = require('../../utils/functions');
const config = require('../../config');

module.exports = {
    name: 'menu',
    category: 'user',
    description: 'Displays the full command menu.',
    emoji: '📋',
    // The signature now accepts the 'commands' map
    async execute(sock, msg, args, commands) {
        const uptime = process.uptime();
        const totalRam = os.totalmem();
        const freeRam = os.freemem();
        const usedRam = totalRam - freeRam;
        const ramString = `${formatBytes(usedRam)} / ${formatBytes(totalRam)}`;
        const uptimeString = formatUptime(uptime);
        
        const categorizedCommands = {};
        commands.forEach(cmd => {
            if (!categorizedCommands[cmd.category]) {
                categorizedCommands[cmd.category] = [];
            }
            categorizedCommands[cmd.category].push(cmd.name);
        });

        const sortedCategories = Object.keys(categorizedCommands).sort();

        let menuText = `╭━━《 𝗪𝗛𝗜𝗭 𝗟𝗜𝗧𝗘 》━━┈⊷\n┃ ❍╭────|─────────\n┃ ❍┃ • ᴜꜱᴇʀ    : ${msg.pushName || 'User'}\n┃ ❍┃ • ᴍᴏᴅᴇ    : Public\n┃ ❍┃ • ᴘʀᴇғɪx  : ${config.PREFIX}\n┃ ❍┃ • ᴄᴏᴍᴍᴀɴᴅꜱ: ${commands.size}\n┃ ❍┃ • ᴠᴇʀꜱɪᴏɴ : 1.0.7\n┃ ❍┃ • ʀᴀᴍ     : ${ramString}\n┃ ❍┃ • ᴜᴘᴛɪᴍᴇ  : ${uptimeString}\n┃ ❍╰────|───────\n╰━━━━━━━━━━┈⊷`;

        for (const category of sortedCategories) {
            const categoryName = category.toUpperCase().replace('_', ' & ');
            menuText += `\n\n    *${categoryName}*`;
            menuText += `\n┃ ❍╭─────────────`;
            categorizedCommands[category].sort().forEach(cmdName => {
                menuText += `\n┃ ❍┃ • ${cmdName}`;
            });
            menuText += `\n┃ ❍╰─────────────`;
        }

        menuText += `\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝗪𝗛𝗜𝗭𝗟𝗜𝗧𝗘 © 𝟮𝟬𝟮𝟱`;
        
        await sock.sendMessage(msg.key.remoteJid, { text: menuText }, { quoted: msg });
    }
};