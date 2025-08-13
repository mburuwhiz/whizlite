module.exports = {
    name: 'rps',
    category: 'games',
    description: 'Play a game of Rock, Paper, Scissors with the bot.',
    emoji: '🗿',
    async execute(sock, msg, args) {
        const choices = ['rock', 'paper', 'scissors'];
        const choiceEmojis = { rock: '🗿', paper: '📄', scissors: '✂️' };
        
        const userChoice = args[0]?.toLowerCase();
        if (!userChoice || !choices.includes(userChoice)) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid choice! Use `.rps <rock|paper|scissors>`' }, { quoted: msg });
        }

        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        let resultText = `You chose ${choiceEmojis[userChoice]} (${userChoice})\nI chose ${choiceEmojis[botChoice]} (${botChoice})\n\n`;

        if (userChoice === botChoice) {
            resultText += "*It's a tie!* 😐";
        } else if (
            (userChoice === 'rock' && botChoice === 'scissors') ||
            (userChoice === 'paper' && botChoice === 'rock') ||
            (userChoice === 'scissors' && botChoice === 'paper')
        ) {
            resultText += "*You win!* 🎉";
        } else {
            resultText += "*You lose!* 😔";
        }

        await sock.sendMessage(msg.key.remoteJid, { text: resultText }, { quoted: msg });
    }
};