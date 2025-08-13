require('dotenv').config();

const config = {
    // Bot settings
    PREFIX: process.env.PREFIX || '.',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '',
    OWNER_NAME: process.env.OWNER_NAME || 'Whiz Tech',
    BOT_MODE: process.env.BOT_MODE || 'public', // <-- ADDED THIS LINE

    // Automation Master Controls
    AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS === 'true',
    AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS === 'true',
    ENABLE_WELCOME_GOODBYE: process.env.ENABLE_WELCOME_GOODBYE === 'true',
    ENABLE_AUTOREPLY: process.env.ENABLE_AUTOREPLY === 'true',
    ENABLE_AUTOREACT: process.env.ENABLE_AUTOREACT === 'true',

    // API Keys
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
    REMOVEBG_API_KEY: process.env.REMOVEBG_API_KEY || '',
    CURRENCY_API_KEY: process.env.CURRENCY_API_KEY || '',
    PEXELS_API_KEY: process.env.PEXELS_API_KEY || '',
    DEEPAI_API_KEY: process.env.DEEPAI_API_KEY || '',
    DEEPL_API_KEY: process.env.DEEPL_API_KEY || '',
    
    // Session ID
    SESSION_ID: process.env.SESSION_ID || '',
};

module.exports = config;