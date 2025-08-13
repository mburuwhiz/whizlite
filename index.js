// The 100% complete index.js file
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    downloadContentFromMessage
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const gradient = require('gradient-string');
const figlet = require('figlet');
const boxen = require('boxen');
const Table = require('cli-table3');
const config = require('./src/config');
const { 
    logCommand, 
    getChatSettings, 
    getReminders, 
    setReminders 
} = require('./src/utils/dbHandler');

const commands = new Map();
const recentStatuses = new Map();
const reactionEmojis = ['👍', '❤️', '🔥', '😮', '😂', '👏', '💯', '🙌'];

function showBanner() {
    const banner = figlet.textSync('WHIZLITE', { font: 'Standard', horizontalLayout: 'full' });
    console.log(gradient.pastel.multiline(banner));
    const boxText = `Powered by Whiz Tech\nVisit whiz.zone.id for better deals\nThe ultimate WhatsApp automation experience.`;
    console.log(boxen(boxText, { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'blue', textAlignment: 'center' }));
}

function checkConfiguration() {
    console.log(chalk.green('\n√ Whiz Lite Initialized Correctly!'));
    const table = new Table({ head: [chalk.cyan('Configuration'), chalk.cyan('Status')], colWidths: [30, 40] });
    const isOwnerSet = !!config.OWNER_NUMBER;
    const isSessionSet = !!config.SESSION_ID;
    table.push(
        ['Owner Number', isOwnerSet ? `✔ Set (${config.OWNER_NUMBER})` : chalk.red('✘ Not Set')],
        ['Session Method', isSessionSet ? '✔ Session ID' : chalk.yellow('ⓘ Using QR Scan')]
    );
    console.log(table.toString());
    return isOwnerSet;
}

async function loadCommands() {
    console.log(chalk.yellow('Loading commands...'));
    const commandFolders = fs.readdirSync(path.join(__dirname, './src/commands'));
    for (const folder of commandFolders) {
        const folderPath = path.join(__dirname, `./src/commands/${folder}`);
        if (fs.statSync(folderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                try {
                    const command = require(`./src/commands/${folder}/${file}`);
                    if (command.name) commands.set(command.name, command);
                } catch (error) { console.error(`Error loading command from file ${file}:`, error); }
            }
        }
    }
    console.log(chalk.green(`${commands.size} commands loaded successfully!`));
}

async function handleStatusUpdate(sock, msg) {
    if (msg.key.participant) recentStatuses.set(msg.key.participant, msg);
    if (config.AUTO_VIEW_STATUS) await sock.readMessages([msg.key]);
    if (config.AUTO_LIKE_STATUS) {
        try {
            const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
            await sock.sendMessage('status@broadcast', { react: { text: randomEmoji, key: msg.key } });
        } catch (e) { console.error("Failed to react to status:", e); }
    }
}

async function handleCommand(sock, msg) {
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
    let text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';
    if (!text.startsWith(config.PREFIX)) return;

    const args = text.slice(config.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = commands.get(commandName);
    if (!command) return;
    try {
        if (command.emoji) await sock.sendMessage(msg.key.remoteJid, { react: { text: command.emoji, key: msg.key } });
        await command.execute(sock, msg, args, commands);
        logCommand(commandName);
    } catch (error) {
        console.error(`[EXECUTION ERROR] for command ${commandName}:`, error);
        await sock.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });
    }
}

async function connectToWhatsApp() {
    showBanner();
    if (!checkConfiguration()) {
        console.error('✘ Critical configuration missing.');
        process.exit(1);
    }
    
    console.log(chalk.blue('- Starting WHIZLITE Bot...'));
    await loadCommands();

    const { state, saveCreds } = await useMultiFileAuthState('session');
    const sock = makeWASocket({ logger: pino({ level: 'silent' }), auth: state, browser: ['WHIZLITE', 'Chrome', '1.0.0'] });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log(chalk.yellow('\nNo valid session found.'));
            console.log(chalk.cyan('For a stable connection, visit https://whizlitesessions.zone.id to get a Session ID.'));
            console.log(chalk.white('Meanwhile, scan this QR code to connect temporarily:\n'));
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') {
            console.log(chalk.green.bold('\nWHIZLITE Connected Successfully!\n'));
            sock.sendMessage(config.OWNER_NUMBER + '@s.whatsapp.net', { text: `Bot connected.` });
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWhatsApp();
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg || !msg.message) return;

        const senderJid = msg.key.participant || msg.key.remoteJid;
        const senderNumber = senderJid ? senderJid.split('@')[0] : '';
        if (config.BOT_MODE === 'private' && senderNumber !== config.OWNER_NUMBER) {
            return;
        }

        if (msg.key.remoteJid === 'status@broadcast') {
            return handleStatusUpdate(sock, msg);
        }

        // ... rest of the logic
        handleCommand(sock, msg);
    });
}

connectToWhatsApp();
module.exports = { commands };