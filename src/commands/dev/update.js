const { exec } = require('child_process');
const config = require('../../config');

module.exports = {
    name: 'update',
    category: 'dev',
    description: 'Updates the bot with the latest code from GitHub. (Owner only)',
    emoji: '🔄',
    async execute(sock, msg, args) {
        if (msg.key.remoteJid.split('@')[0] !== config.OWNER_NUMBER) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'This is an owner-only command.' }, { quoted: msg });
        }

        await sock.sendMessage(msg.key.remoteJid, { text: 'Checking for updates...' }, { quoted: msg });

        exec('git pull', async (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return await sock.sendMessage(msg.key.remoteJid, { text: 'An error occurred while updating.' }, { quoted: msg });
            }
            if (stdout.includes("Already up to date.")) {
                return await sock.sendMessage(msg.key.remoteJid, { text: 'The bot is already on the latest version.' }, { quoted: msg });
            }
            
            await sock.sendMessage(msg.key.remoteJid, { text: 'Update found. Installing new dependencies and restarting...' }, { quoted: msg });
            
            // Install new dependencies
            exec('npm install --legacy-peer-deps', (npmErr, npmStdout, npmStderr) => {
                if (npmErr) {
                    console.error(npmErr);
                    return sock.sendMessage(msg.key.remoteJid, { text: 'Failed to install new dependencies. Please check the console.' });
                }
                
                // Restart the bot
                process.exit(0);
            });
        });
    }
};