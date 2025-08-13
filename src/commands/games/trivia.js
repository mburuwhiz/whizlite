const axios = require('axios');
const he = require('he');

const triviaGames = new Map();

module.exports = {
    name: 'trivia',
    category: 'games',
    description: 'Starts a trivia quiz question.',
    emoji: '🧠',
    games: triviaGames,
    async execute(sock, msg, args) {
    const { remoteJid } = msg.key;
        if (triviaGames.has(remoteJid)) {
            return await sock.sendMessage(remoteJid, { text: 'A trivia question is already active in this chat!' }, { quoted: msg });
        }

        try {
            const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
            const data = response.data.results[0];
            
            const question = he.decode(data.question);
            const correctAnswer = he.decode(data.correct_answer);
            const incorrectAnswers = data.incorrect_answers.map(a => he.decode(a));
            
            const options = [...incorrectAnswers, correctAnswer].sort(() => Math.random() - 0.5);
            const correctIndex = options.findIndex(option => option === correctAnswer);
            const correctLetter = String.fromCharCode(65 + correctIndex); // A, B, C, D

            const game = {
                question,
                options,
                correctAnswer,
                correctLetter
            };
            triviaGames.set(remoteJid, game);
            
            let triviaText = `*TRIVIA TIME!*\n\n*Question:* ${question}\n\n`;
            options.forEach((option, index) => {
                triviaText += `${String.fromCharCode(65 + index)}. ${option}\n`;
            });
            triviaText += `\nUse \`.answer <letter>\` to answer.`;
            
            await sock.sendMessage(remoteJid, { text: triviaText }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(remoteJid, { text: 'Could not fetch a trivia question. Please try again later.' }, { quoted: msg });
        }
    }
};