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
const express = require('express');
const config = require('./src/config');
const { 
    logCommand, 
    getChatSettings, 
    getReminders, 
    setReminders 
} = require('./src/utils/dbHandler');

// --- GLOBAL VARIABLES ---
const commands = new Map();
const recentStatuses = new Map();
const reactionEmojis = ['👍', '❤️', '🔥', '😮', '😂', '👏', '💯', '🙌'];

// --- LOGGER LOGIC ---
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

// --- COMMAND HANDLER LOGIC ---
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

// --- STATUS HANDLER LOGIC ---
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

// --- REMINDER SCHEDULER ---
function startReminderChecker(sock) {
    console.log(chalk.green('Reminder checker started.'));
    setInterval(async () => {
        try {
            const reminders = getReminders();
            const now = Date.now();
            const dueReminders = reminders.filter(r => r.time <= now);
            if (dueReminders.length > 0) {
                for (const reminder of dueReminders) {
                    await sock.sendMessage(reminder.userJid, { text: `🔔 *Reminder:* ${reminder.reason}` });
                }
                const remainingReminders = reminders.filter(r => r.time > now);
                setReminders(remainingReminders);
            }
        } catch (e) { console.error("Error checking reminders:", e); }
    }, 60000);
}

// --- MAIN BOT LOGIC ---
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
            const connectionTime = Date.now() - (global.startTime || Date.now());
            console.log(chalk.green.bold('\nWHIZLITE Connected Successfully!\n'));
            startReminderChecker(sock);
            
            setTimeout(() => {
                const uptimeInSeconds = process.uptime();
                const hours = Math.floor(uptimeInSeconds / 3600), minutes = Math.floor((uptimeInSeconds % 3600) / 60), seconds = Math.floor(uptimeInSeconds % 60);
                const formattedUptime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                const statusBlock = `╭──「 *WHIZ LITE IS LIVE!* 」──╮\n│ 🧑‍💻 *Prefix:* ${config.PREFIX}\n│ 👤 *User:* ${config.OWNER_NAME}\n│ 📡 *Speed:* *${connectionTime}ms*\n│ ⏱️ *Uptime:* ${formattedUptime}\n╰─────────────────────╯`.trim();
                const descriptionBlock = "Welcome to WHIZLITE ✨! Your friendly and smart WhatsApp companion. Packed with AI magic 🧠, fun games 🎮, and creative tools 🎨. Ready to make your chats sparkle! 🚀";
                const fullWelcomeMessage = `${statusBlock}\n\n${descriptionBlock}`;
                sock.sendMessage(config.OWNER_NUMBER + '@s.whatsapp.net', { text: fullWelcomeMessage });
            }, 1500);
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
        const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
        if (config.BOT_MODE === 'private') {
            if (senderJid !== ownerJid || msg.key.remoteJid !== ownerJid) {
                return;
            }
        }

        if (msg.key.remoteJid === 'status@broadcast') {
            return handleStatusUpdate(sock, msg);
        }

        const contextInfo = msg.message.extendedTextMessage?.contextInfo;
        const replyText = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (contextInfo && contextInfo.participant === 'status@broadcast' && replyText?.toLowerCase().replace(config.PREFIX, '') === 'save') {
            try {
                const quotedMsg = contextInfo.quotedMessage;
                const userJid = msg.key.remoteJid;
                await sock.sendMessage(userJid, { react: { text: '📥', key: msg.key } });
                if (quotedMsg.imageMessage) {
                    const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
                    let buffer = Buffer.from([]);
                    for await(const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
                    await sock.sendMessage(userJid, { image: buffer, caption: quotedMsg.imageMessage.caption || '' });
                } else if (quotedMsg.videoMessage) {
                    const stream = await downloadContentFromMessage(quotedMsg.videoMessage, 'video');
                    let buffer = Buffer.from([]);
                    for await(const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
                    await sock.sendMessage(userJid, { video: buffer, caption: quotedMsg.videoMessage.caption || '' });
                } else {
                    const statusText = quotedMsg.extendedTextMessage.text;
                    await sock.sendMessage(userJid, { text: `*Saved Status:*\n\n${statusText}` });
                }
                return;
            } catch (e) { console.error("Error in save command:", e); return; }
        }

        if (msg.key.remoteJid.endsWith('@g.us') && !msg.key.fromMe) {
            try {
                const settings = getChatSettings(msg.key.remoteJid);
                const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';
                const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
                const sender = groupMetadata.participants.find(p => p.id === msg.key.participant);
                const senderIsAdmin = sender && (sender.admin === 'admin' || sender.admin === 'superadmin');
                if (settings.antilink && !senderIsAdmin && /(https?:\/\/[^\s]+)/gi.test(text)) { await sock.sendMessage(msg.key.remoteJid, { delete: msg.key }); return; }
                if (settings.antiword.enabled && !senderIsAdmin && settings.antiword.words.some(word => new RegExp(`\\b${word}\\b`, 'i').test(text))) { await sock.sendMessage(msg.key.remoteJid, { delete: msg.key }); return; }
            } catch (e) { console.error("Error in moderation check:", e); }
        }
        
        handleCommand(sock, msg);
    });
}

// Store start time globally to calculate connection speed
global.startTime = Date.now();
connectToWhatsApp();

// --- Dummy Express Server for Render Web Service ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('<h1>WHIZLITE Bot is running! 🚀</h1><p>The bot is active on WhatsApp. This page is just to satisfy hosting requirements.</p>');
});
app.listen(PORT, () => {
    console.log(chalk.green(`Server started on port ${PORT}. Bot is ready!`));
});

module.exports = { commands };
