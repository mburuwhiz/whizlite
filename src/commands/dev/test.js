module.exports = {
    name: 'test',
    category: 'dev',
    description: 'A simple test command.',
    emoji: '🧪',
    async execute(sock, msg, args) {
        await sock.sendMessage(msg.key.remoteJid, { text: 'Test from command file OK!' }, { quoted: msg });
    }
};