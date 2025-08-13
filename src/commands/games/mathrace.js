// In-memory store for active math races
const mathGames = new Map();

module.exports = {
    name: 'mathrace',
    category: 'games',
    description: 'Starts a speed-based math challenge.',
    emoji: '🔢',
    games: mathGames,
    async execute(sock, msg, args) {
        const { remoteJid } = msg.key;
        if (mathGames.has(remoteJid)) {
            return await sock.sendMessage(remoteJid, { text: 'A math race is already in progress!' }, { quoted: msg });
        }

        const operators = ['+', '-', '*'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        
        let question = `${num1} ${operator} ${num2}`;
        let answer;

        // Ensure result is not negative for simplicity
        if (operator === '-' && num1 < num2) {
            question = `${num2} - ${num1}`;
            answer = num2 - num1;
        } else {
            answer = eval(question);
        }

        mathGames.set(remoteJid, { answer, startTime: Date.now() });

        await sock.sendMessage(remoteJid, { text: `First to solve wins! 🏁\n\n*${question} = ?*\n\nUse \`.solve <answer>\` to submit.` });

        setTimeout(() => {
            if (mathGames.has(remoteJid) && mathGames.get(remoteJid).answer === answer) {
                sock.sendMessage(remoteJid, { text: `Time's up! The answer was *${answer}*.` });
                mathGames.delete(remoteJid);
            }
        }, 20000); // 20 second time limit
    }
};
