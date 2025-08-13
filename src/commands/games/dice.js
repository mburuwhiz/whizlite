module.exports = {
    name: 'dice',
    category: 'games',
    description: 'Rolls one or more dice.',
    emoji: '🎲',
    async execute(sock, msg, args) {
        let rolls = 1;
        let sides = 6;

        if (args.length > 0) {
            const input = args[0].toLowerCase();
            if (input.includes('d')) {
                const [numRolls, numSides] = input.split('d');
                rolls = parseInt(numRolls) || 1;
                sides = parseInt(numSides) || 6;
            } else {
                rolls = parseInt(input) || 1;
            }
        }
        
        if (rolls > 100) return await sock.sendMessage(msg.key.remoteJid, { text: 'You can roll a maximum of 100 dice at a time.' }, { quoted: msg });
        if (sides > 1000) return await sock.sendMessage(msg.key.remoteJid, { text: 'The maximum number of sides is 1000.' }, { quoted: msg });

        const results = [];
        let total = 0;
        for (let i = 0; i < rolls; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            results.push(roll);
            total += roll;
        }

        let replyText = `You rolled ${rolls}d${sides}:\n\n*Results:* ${results.join(', ')}`;
        if (rolls > 1) {
            replyText += `\n*Total:* ${total}`;
        }
        
        await sock.sendMessage(msg.key.remoteJid, { text: replyText }, { quoted: msg });
    }
};