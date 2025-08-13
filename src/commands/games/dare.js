module.exports = {
    name: 'dare',
    category: 'games',
    description: 'Get a random dare.',
    emoji: '😈',
    async execute(sock, msg, args) {
        const dares = [
            "Send a voice note singing your favorite song.",
            "Send the 5th emoji from your recently used list.",
            "Talk in rhymes for the next 3 messages in this chat.",
            "Tell a dad joke in the chat.",
            "Send a selfie making a funny face.",
            "Let the group choose your profile picture for the next 10 minutes.",
            "Type a message with your eyes closed and send it.",
            "Send a screenshot of your phone's home screen.",
            "Tell us your most controversial opinion.",
            "Start a sentence with 'I am a unicorn' and make the rest of the sentence believable."
        ];
        
        const randomDare = dares[Math.floor(Math.random() * dares.length)];
        await sock.sendMessage(msg.key.remoteJid, { text: `*Dare:* ${randomDare}` }, { quoted: msg });
    }
};