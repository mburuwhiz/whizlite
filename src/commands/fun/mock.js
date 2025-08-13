module.exports = {
    name: 'mock',
    category: 'fun',
    description: 'Applies the SpongeBob mocking text effect.',
    emoji: '🤪',
    async execute(sock, msg, args) {
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'wHaT sHoUlD i MoCk?' }, { quoted: msg });
        }
        const text = args.join(' ');
        let mockedText = '';
        for (let i = 0; i < text.length; i++) {
            mockedText += i % 2 === 0 ? text[i].toLowerCase() : text[i].toUpperCase();
        }
        await sock.sendMessage(msg.key.remoteJid, { text: mockedText }, { quoted: msg });
    }
};