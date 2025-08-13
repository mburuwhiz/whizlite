module.exports = {
    name: '8ball',
    category: 'fun',
    description: 'Asks the magic 8-ball a question.',
    emoji: '🎱',
    async execute(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, { text: 'You need to ask a question!' }, { quoted: msg });
            return;
        }

        const responses = [
            'It is certain.',
            'It is decidedly so.',
            'Without a doubt.',
            'Yes – definitely.',
            'You may rely on it.',
            'As I see it, yes.',
            'Most likely.',
            'Outlook good.',
            'Yes.',
            'Signs point to yes.',
            'Reply hazy, try again.',
            'Ask again later.',
            'Better not tell you now.',
            'Cannot predict now.',
            'Concentrate and ask again.',
            'Don\'t count on it.',
            'My reply is no.',
            'My sources say no.',
            'Outlook not so good.',
            'Very doubtful.'
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        await sock.sendMessage(msg.key.remoteJid, { text: `🎱 *Magic 8-Ball says:* ${randomResponse}` }, { quoted: msg });
    }
};