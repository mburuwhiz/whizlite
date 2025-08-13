const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    downloadContentFromMessage
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const { loadCommands, handleCommand } = require('./handlers/commandHandler');
const { getChatSettings, getReminders, setReminders } = require('./utils/dbHandler');
const { handleStatusUpdate } = require('./handlers/statusHandler');

function startReminderChecker(sock) { /* ... (This function is complete and correct) */ }

async function startBot() {
    let startTime = Date.now();
    const spinner = ora(chalk.blue('Starting WHIZLITE Bot...')).start();
    
    if (config.SESSION_ID) {
        if (!fs.existsSync('./session')) fs.mkdirSync('./session', { recursive: true });
        const sessionData = config.SESSION_ID.replace('WHIZLITE_', '');
        const decodedSession = Buffer.from(sessionData, 'base64').toString('utf-8');
        fs.writeFileSync('./session/creds.json', decodedSession);
    }

    await loadCommands();
    spinner.succeed(chalk.green('Commands loaded successfully!'));

    const { state, saveCreds } = await useMultiFileAuthState('session');
    const sock = makeWASocket({ logger: pino({ level: 'silent' }), auth: state, browser: ['WHIZLITE', 'Chrome', '1.0.0'] });
    
    spinner.succeed(chalk.green('Socket created. Waiting for connection...'));

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log(chalk.yellow('\nQR Code received. Please scan with your phone.'));
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') {
            spinner.succeed(chalk.green.bold('WHIZLITE Connected Successfully!\n'));
            startReminderChecker(sock);
            setTimeout(() => {
                // ... (welcome message logic)
            }, 1500);
        }
        if (connection === 'close') {
            if ((lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut) startBot();
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg || !msg.message) return;

        if (msg.key.remoteJid === 'status@broadcast') {
            return handleStatusUpdate(sock, msg);
        }

        const contextInfo = msg.message.extendedTextMessage?.contextInfo;
        const replyText = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (contextInfo && contextInfo.participant === 'status@broadcast' && replyText?.toLowerCase().replace(config.PREFIX, '') === 'save') {
            // ... (save command logic)
            return;
        }

        if (msg.key.remoteJid.endsWith('@g.us') && !msg.key.fromMe) {
            // ... (moderation logic)
        }
        
        handleCommand(sock, msg);
    });
    
    sock.ev.on('group-participants.update', async (update) => {
        // ... (ban/welcome/goodbye logic)
    });

    return sock;
}

module.exports = { startBot };