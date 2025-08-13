const fs = require('fs');
const path = require('path');
const config = require('../config');
const { logCommand } = require('../utils/dbHandler');

const commands = new Map();

const loadCommands = async () => {
    const commandFolders = fs.readdirSync(path.join(__dirname, '../commands'));
    for (const folder of commandFolders) {
        const folderPath = path.join(__dirname, `../commands/${folder}`);
        if (fs.statSync(folderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                try {
                    const command = require(`../commands/${folder}/${file}`);
                    if (command.name) {
                        commands.set(command.name, command);
                    }
                } catch (error) {
                    console.error(`Error loading command from file ${file}:`, error);
                }
            }
        }
    }
};

const handleCommand = async (sock, msg) => {
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') {
        return;
    }

    let text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';
    if (!text.startsWith(config.PREFIX)) return;

    const args = text.slice(config.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = commands.get(commandName);

    if (!command) return;
    
    // Allows self-testing by not checking fromMe
    
    try {
        if (command.emoji) {
            await sock.sendMessage(msg.key.remoteJid, { react: { text: command.emoji, key: msg.key } });
        }
        await command.execute(sock, msg, args);
        logCommand(commandName);
    } catch (error) {
        console.error(`[EXECUTION ERROR] for command ${commandName}:`, error);
        await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
    }
};

module.exports = { loadCommands, handleCommand, commands };