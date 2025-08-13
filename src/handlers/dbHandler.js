const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../database.json');

// Default settings for any new chat
const defaultChatSettings = {
    antilink: false,
    antiword: { enabled: false, words: [] },
    bannedUsers: [],
    rules: "No rules have been set for this group yet.",
    welcome: { enabled: false, message: "Welcome @user to {group_name}!" },
    goodbye: { enabled: false, message: "Goodbye @user, we'll miss you!" },
    autoreply: { enabled: false, message: "Hi, I am WHIZLITE. How can I help you?" },
    autoreact: { enabled: false, reactions: {} }
};

function readDb() {
    let db = { chats: {}, notes: {}, reminders: [] };
    if (fs.existsSync(dbPath)) {
        try {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            if (!db.chats) db.chats = {};
            if (!db.notes) db.notes = {};
            if (!db.reminders) db.reminders = [];
        } catch (e) { console.error("Error reading database.json:", e); }
    } else {
        writeDb(db);
    }
    return db;
}

function writeDb(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function getChatSettings(chatId) {
    const db = readDb();
    if (!db.chats[chatId]) {
        db.chats[chatId] = { ...defaultChatSettings };
        writeDb(db);
    }
    db.chats[chatId] = { ...defaultChatSettings, ...db.chats[chatId] };
    return db.chats[chatId];
}

function updateChatSettings(chatId, newSettings) {
    const db = readDb();
    const existingSettings = getChatSettings(chatId);
    db.chats[chatId] = { ...existingSettings, ...newSettings };
    writeDb(db);
}

// Notes and Reminders functions (from Phase 17)
function getNotes(userId) {
    const db = readDb();
    return db.notes[userId] || [];
}
function addNote(userId, note) {
    const db = readDb();
    if (!db.notes[userId]) db.notes[userId] = [];
    db.notes[userId].push(note);
    writeDb(db);
}
function deleteNote(userId, noteIndex) {
    const db = readDb();
    if (db.notes[userId] && db.notes[userId][noteIndex]) {
        db.notes[userId].splice(noteIndex, 1);
        writeDb(db);
        return true;
    }
    return false;
}
function getReminders() {
    const db = readDb();
    return db.reminders;
}
function addReminder(reminder) {
    const db = readDb();
    db.reminders.push(reminder);
    writeDb(db);
}
function setReminders(reminders) {
    const db = readDb();
    db.reminders = reminders;
    writeDb(db);
}

module.exports = {
    getChatSettings, updateChatSettings,
    getNotes, addNote, deleteNote,
    getReminders, addReminder, setReminders
};