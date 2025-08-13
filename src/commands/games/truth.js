module.exports = {
    name: 'truth',
    category: 'games',
    description: 'Get a random truth question.',
    emoji: '😇',
    async execute(sock, msg, args) {
        const truths = [
            "What's the most embarrassing thing you've ever done?",
            "What's a secret you've never told anyone?",
            "What's your biggest fear?",
            "Who is your secret crush?",
            "What's the biggest lie you've ever told?",
            "What's something you're self-conscious about?",
            "Have you ever cheated on a test?",
            "What's the most childish thing you still do?",
            "What's the weirdest dream you've ever had?",
            "What is one thing you would change about your appearance if you could?",
            "What's the last thing you searched for on your phone?",
            "If you had to delete one app from your phone, which one would it be?",
            "What's a movie that made you cry?",
            "What's the most trouble you've ever been in?",
            "What's the worst gift you've ever received?"
        ];
        
        const randomTruth = truths[Math.floor(Math.random() * truths.length)];
        await sock.sendMessage(msg.key.remoteJid, { text: `*Truth:* ${randomTruth}` }, { quoted: msg });
    }
};