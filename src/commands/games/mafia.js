const mafiaGames = new Map();

// Helper function to send DMs
async function sendDM(sock, jid, text) {
    try {
        await sock.sendMessage(jid, { text });
    } catch (e) {
        console.error(`Failed to send DM to ${jid}`, e);
    }
}

module.exports = {
    name: 'mafia',
    category: 'games',
    description: 'Starts a game of Mafia.',
    emoji: '🕵️',
    async execute(sock, msg, args) {
        const { remoteJid, participant } = msg.key;
        const subCommand = args[0]?.toLowerCase();
        const game = mafiaGames.get(remoteJid);

        if (subCommand === 'start') {
            if (game) return await sock.sendMessage(remoteJid, { text: 'A game is already in progress.' });
            
            const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const players = [participant, ...mentionedJids];

            if (players.length < 4) {
                return await sock.sendMessage(remoteJid, { text: 'You need at least 4 players to start a game of Mafia.' });
            }

            // Assign roles
            let roles = ['Mafia', 'Doctor', 'Sheriff'];
            for (let i = 3; i < players.length; i++) roles.push('Villager');
            roles.sort(() => Math.random() - 0.5); // Shuffle roles

            const newGame = {
                players: new Map(),
                state: 'night', // 'night', 'day', 'voting'
                round: 1,
                killedTonight: null,
                savedTonight: null,
                votes: new Map()
            };

            let mafiaJid;
            players.forEach((jid, i) => {
                newGame.players.set(jid, { role: roles[i], alive: true });
                if (roles[i] === 'Mafia') mafiaJid = jid;
            });

            mafiaGames.set(remoteJid, newGame);
            
            await sock.sendMessage(remoteJid, { text: `A game of Mafia has begun with ${players.length} players! Roles are being sent via DM.` });

            // Send roles via DM
            for (const [jid, playerData] of newGame.players.entries()) {
                await sendDM(sock, jid, `Your role is: *${playerData.role}*`);
            }
            
            setTimeout(() => {
                sendDM(sock, mafiaJid, "It is Night 1. As the Mafia, please DM me `.kill @user` to choose your target.");
            }, 2000);
            
        } else if (subCommand === 'end') {
            if (!game) return await sock.sendMessage(remoteJid, { text: 'No game is in progress.' });
            mafiaGames.delete(remoteJid);
            await sock.sendMessage(remoteJid, { text: 'The game of Mafia has been ended.' });
        } else {
            // Handle in-game actions like .kill, .save, .check, .vote
            // This would be a very large implementation. For now, we focus on setup.
            await sock.sendMessage(remoteJid, { text: 'Use `.mafia start @players` or `.mafia end`.' });
        }
    }
};