const categoryData = {
    'Fruits': ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew'],
    'Countries': ['argentina', 'brazil', 'canada', 'denmark', 'egypt', 'finland', 'germany', 'hungary'],
    'Animals': ['antelope', 'bear', 'cat', 'dog', 'elephant', 'fox', 'giraffe', 'hippo']
};

const categoryGames = new Map();

module.exports = {
    name: 'categories',
    category: 'games',
    description: 'Starts a game of categories.',
    emoji: '📚',
    games: categoryGames,
    async execute(sock, msg, args) {
        const { remoteJid } = msg.key;
        if (categoryGames.has(remoteJid)) {
            return await sock.sendMessage(remoteJid, { text: 'A game of Categories is already in progress!' }, { quoted: msg });
        }

        const categoryKeys = Object.keys(categoryData);
        const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
        const randomWord = categoryData[randomCategory][Math.floor(Math.random() * categoryData[randomCategory].length)];
        const firstLetter = randomWord.charAt(0).toUpperCase();

        const validAnswers = new Set(categoryData[randomCategory].filter(word => word.startsWith(firstLetter.toLowerCase())));
        
        categoryGames.set(remoteJid, { category: randomCategory, letter: firstLetter, answers: validAnswers });
        
        await sock.sendMessage(remoteJid, { text: `First person to name a *${randomCategory}* that starts with the letter *'${firstLetter}'* wins!\n\nUse \`.name <answer>\` to play.` });

        setTimeout(() => {
            if (categoryGames.has(remoteJid)) {
                sock.sendMessage(remoteJid, { text: `Time's up! No one guessed correctly.` });
                categoryGames.delete(remoteJid);
            }
        }, 25000); // 25 second time limit
    }
};