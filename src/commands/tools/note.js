const { getNotes, addNote, deleteNote } = require('../../utils/dbHandler');

module.exports = {
    name: 'note',
    category: 'tools',
    description: 'Saves and manages personal notes.',
    emoji: '📝',
    async execute(sock, msg, args) {
        const userId = msg.key.remoteJid;
        const subCommand = args[0]?.toLowerCase();
        const content = args.slice(1).join(' ');

        switch (subCommand) {
            case 'add':
                if (!content) return await sock.sendMessage(userId, { text: 'Usage: .note add <your note text>' });
                addNote(userId, content);
                await sock.sendMessage(userId, { text: 'Note saved successfully!' });
                break;
            
            case 'list':
                const notes = getNotes(userId);
                if (notes.length === 0) return await sock.sendMessage(userId, { text: 'You have no saved notes.' });
                
                let noteList = '*Your Saved Notes:*\n\n';
                notes.forEach((note, index) => {
                    noteList += `${index + 1}. ${note}\n`;
                });
                await sock.sendMessage(userId, { text: noteList });
                break;
                
            case 'del':
            case 'delete':
                const noteIndex = parseInt(content) - 1;
                if (isNaN(noteIndex)) return await sock.sendMessage(userId, { text: 'Please provide a valid note number to delete.' });
                
                if (deleteNote(userId, noteIndex)) {
                    await sock.sendMessage(userId, { text: `Note number ${noteIndex + 1} has been deleted.` });
                } else {
                    await sock.sendMessage(userId, { text: 'Invalid note number.' });
                }
                break;
            
            default:
                await sock.sendMessage(userId, { text: 'Usage:\n- `.note add <text>`\n- `.note list`\n- `.note del <number>`' });
        }
    }
};