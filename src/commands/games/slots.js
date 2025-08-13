module.exports = {
    name: 'slots',
    category: 'games',
    description: 'Play the emoji slot machine.',
    emoji: '🎰',
    async execute(sock, msg, args) {
        const symbols = ['🍒', '🍋', '🍊', '🍉', '🍇', '💎', '💰'];
        
        // "Spin" the slots
        const s1 = symbols[Math.floor(Math.random() * symbols.length)];
        const s2 = symbols[Math.floor(Math.random() * symbols.length)];
        const s3 = symbols[Math.floor(Math.random() * symbols.length)];

        let resultText = `*WHIZLITE SLOTS*\n\n[ ${s1} | ${s2} | ${s3} ]\n\n`;

        if (s1 === s2 && s2 === s3) {
            resultText += `*JACKPOT!* 💰💰💰 You won big time!`;
        } else if (s1 === s2 || s1 === s3 || s2 === s3) {
            resultText += `*You win!* 🎉 A small prize for you.`;
        } else {
            resultText += `*You lose!* 😔 Better luck next time.`;
        }

        await sock.sendMessage(msg.key.remoteJid, { text: resultText }, { quoted: msg });
    }
};