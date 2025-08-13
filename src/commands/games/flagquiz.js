const axios = require('axios');

// In-memory store for active flag quizzes
const flagGames = new Map();

module.exports = {
    name: 'flagquiz',
    category: 'games',
    description: 'Starts a flag guessing game.',
    emoji: '🎌',
    games: flagGames, // Export for the 'g' command to use
    async execute(sock, msg, args) {
        const { remoteJid } = msg.key;
        if (flagGames.has(remoteJid)) {
            return await sock.sendMessage(remoteJid, { text: 'A flag quiz is already in progress in this chat! Use `.g <country>` to guess.' }, { quoted: msg });
        }

        const spinner = await sock.sendMessage(remoteJid, { text: 'Fetching a new flag... ⏳' }, { quoted: msg });

        try {
            const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,flags');
            const countries = response.data;
            const randomCountry = countries[Math.floor(Math.random() * countries.length)];

            const countryName = randomCountry.name.common;
            const flagUrl = randomCountry.flags.png;

            // Store the correct answer for this chat
            flagGames.set(remoteJid, { correctAnswer: countryName });

            await sock.sendMessage(remoteJid, {
                image: { url: flagUrl },
                caption: 'Which country\'s flag is this?\n\nUse `.g <country name>` to guess!'
            });
            await sock.sendMessage(remoteJid, { delete: spinner.key });

            // Set a timeout to end the game after 30 seconds
            setTimeout(() => {
                if (flagGames.has(remoteJid) && flagGames.get(remoteJid).correctAnswer === countryName) {
                    sock.sendMessage(remoteJid, { text: `Time's up! The correct answer was *${countryName}*.` });
                    flagGames.delete(remoteJid);
                }
            }, 30000);

        } catch (e) {
            console.error('Flag Quiz Error:', e);
            await sock.sendMessage(remoteJid, { text: 'Could not fetch a flag to start the quiz. Please try again later.' }, { quoted: msg, edit: spinner.key });
        }
    }
};