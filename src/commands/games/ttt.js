// In-memory store for Tic-Tac-Toe games
const tttGames = new Map();

function getBoard(board) {
    const emojis = { 'X': '❌', 'O': '⭕' };
    let boardStr = '```';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const cell = board[i][j];
            boardStr += ` ${emojis[cell] || (i * 3 + j + 1)} `;
            if (j < 2) boardStr += '|';
        }
        if (i < 2) boardStr += '\n---+---+---\n';
    }
    boardStr += '```';
    return boardStr;
}

function checkWinner(board) {
    const lines = [
        // Rows
        [board[0][0], board[0][1], board[0][2]],
        [board[1][0], board[1][1], board[1][2]],
        [board[2][0], board[2][1], board[2][2]],
        // Columns
        [board[0][0], board[1][0], board[2][0]],
        [board[0][1], board[1][1], board[2][1]],
        [board[0][2], board[1][2], board[2][2]],
        // Diagonals
        [board[0][0], board[1][1], board[2][2]],
        [board[0][2], board[1][1], board[2][0]],
    ];
    for (const line of lines) {
        if (line[0] && line[0] === line[1] && line[1] === line[2]) return line[0];
    }
    return board.flat().every(cell => cell) ? 'tie' : null;
}

module.exports = {
    name: 'ttt',
    category: 'games',
    description: 'Play Tic-Tac-Toe with another user.',
    emoji: '❎',
    async execute(sock, msg, args) {
        const { remoteJid, participant } = msg.key;
        const subCommand = args[0]?.toLowerCase();

        if (subCommand === 'start') {
            if (tttGames.has(remoteJid)) {
                return await sock.sendMessage(remoteJid, { text: 'A game is already in progress in this chat.' }, { quoted: msg });
            }
            const opponent = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid[0];
            if (!opponent) {
                return await sock.sendMessage(remoteJid, { text: 'Please mention an opponent to start a game. `.ttt start @opponent`' }, { quoted: msg });
            }

            const game = {
                board: Array(3).fill(null).map(() => Array(3).fill(null)),
                players: { 'X': participant, 'O': opponent },
                currentPlayer: 'X',
            };
            tttGames.set(remoteJid, game);
            
            let text = `Tic-Tac-Toe game started!\n\nPlayer ❌: @${participant.split('@')[0]}\nPlayer ⭕: @${opponent.split('@')[0]}\n\n${getBoard(game.board)}\n\nIt's @${participant.split('@')[0]}'s turn. Use \`.ttt <number>\` to make a move.`;
            return await sock.sendMessage(remoteJid, { text, mentions: [participant, opponent] });
        }

        if (subCommand === 'end') {
            if (!tttGames.has(remoteJid)) {
                return await sock.sendMessage(remoteJid, { text: 'No game is currently in progress.' }, { quoted: msg });
            }
            tttGames.delete(remoteJid);
            return await sock.sendMessage(remoteJid, { text: 'Game ended by user.' }, { quoted: msg });
        }

        const game = tttGames.get(remoteJid);
        if (!game) return;

        if (participant !== game.players[game.currentPlayer]) {
            return await sock.sendMessage(remoteJid, { text: "It's not your turn!" }, { quoted: msg });
        }

        const move = parseInt(subCommand);
        if (isNaN(move) || move < 1 || move > 9) {
            return await sock.sendMessage(remoteJid, { text: 'Invalid move. Please enter a number from 1 to 9.' }, { quoted: msg });
        }

        const row = Math.floor((move - 1) / 3);
        const col = (move - 1) % 3;

        if (game.board[row][col]) {
            return await sock.sendMessage(remoteJid, { text: 'That spot is already taken! Try another.' }, { quoted: msg });
        }

        game.board[row][col] = game.currentPlayer;
        const winner = checkWinner(game.board);

        if (winner) {
            const winnerId = game.players[winner];
            let text = `*Game Over!*\n\n${getBoard(game.board)}\n\n`;
            text += winner === 'tie' ? "It's a draw!" : `Player ${winner === 'X' ? '❌' : '⭕'} (@${winnerId.split('@')[0]}) wins!`;
            tttGames.delete(remoteJid);
            return await sock.sendMessage(remoteJid, { text, mentions: [winnerId] });
        }

        game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
        const nextPlayerId = game.players[game.currentPlayer];
        let text = `${getBoard(game.board)}\n\nIt's @${nextPlayerId.split('@')[0]}'s turn.`;
        await sock.sendMessage(remoteJid, { text, mentions: [nextPlayerId] });
    }
};