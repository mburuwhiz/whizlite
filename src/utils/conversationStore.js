// A simple in-memory store for conversation history.
// This allows the bot to remember the last few messages from each user.

const conversationHistory = new Map();
const MAX_HISTORY_LENGTH = 6; // Keeps the last 3 pairs of user/assistant messages

function getHistory(userId) {
    return conversationHistory.get(userId) || [];
}

function setHistory(userId, history) {
    // Keep the history from growing too large to save tokens
    if (history.length > MAX_HISTORY_LENGTH) {
        // Removes the oldest two messages (one user, one assistant)
        conversationHistory.set(userId, history.slice(history.length - MAX_HISTORY_LENGTH));
    } else {
        conversationHistory.set(userId, history);
    }
}

function clearHistory(userId) {
    conversationHistory.delete(userId);
}

module.exports = { getHistory, setHistory, clearHistory };