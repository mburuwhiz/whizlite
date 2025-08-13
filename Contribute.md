
-----

### **The Updated `CONTRIBUTING.md` (Developer's Guide)**

Please replace the content of your `CONTRIBUTING.md` file with this new, more detailed version.

```markdown
# Contributing to WHIZLITE: A Developer's Guide

First off, thank you for considering contributing to WHIZLITE! This document is a guide for developers (including you, the owner!) on how to add new commands and features to the bot.

## 📂 File Structure

The project has a very organized and modular structure. Understanding it is key to adding new features.

```

whizlite/
├── src/
│   ├── commands/
│   │   ├── admin/
│   │   ├── ai/
│   │   ├── automation/
│   │   ├── dev/
│   │   ├── fun/
│   │   ├── games/
│   │   ├── media/
│   │   ├── search/
│   │   └── tools/
│   ├── utils/
│   │   ├── dbHandler.js
│   │   └── functions.js
│   ├── config.js
│   └── (other core files)
├── assets/
├── .env
├── database.json
└── index.js

````

* **`index.js`**: The main entry point. It handles the connection, loads all commands, and routes all events.
* **`src/commands/`**: This is where all the magic happens. Every command is a separate file, organized into a category sub-folder.
* **`src/utils/`**: Contains helper files and reusable logic.
* **`database.json`**: Our simple JSON database that stores persistent settings.
* **`.env`**: Your secret keys and master settings.
* **`src/config.js`**: The file that safely loads your `.env` variables into the bot.

## 🛠️ How to Add a New Command

Adding a new command is designed to be very simple.

### **Step 1: Create the Command File**
Choose the most appropriate category folder inside `src/commands/`. For example, a new game would go in `src/commands/games/`.

### **Step 2: Use the Command Template**
Every command file follows the same basic structure. Copy and paste this template into your new file:

```javascript
module.exports = {
    name: 'newcommand',
    category: 'fun',
    description: 'A description of what the new command does.',
    emoji: '✨',
    
    /**
     * @param {object} sock - The socket connection object.
     * @param {object} msg - The full message object.
     * @param {string[]} args - The arguments passed to the command.
     * @param {Map} commands - A map of all loaded commands.
     */
    async execute(sock, msg, args, commands) {
        // Your command logic goes here!
        await sock.sendMessage(msg.key.remoteJid, { text: 'Hello from my new command!' }, { quoted: msg });
    }
};
````

### **Step 3: Restart the Bot**

That's it\! The command loader in `index.js` will automatically find and register your new command.

-----

## 🔑 Creating a Command with API Keys (from `.env`)

Many powerful commands need an API key or a special setting. Here is the 3-step process to do this correctly.

### **Step 1: Add the New Variable to `.env`**

First, add your new key or setting to your `.env` file. It's a good practice to add a comment explaining where to get it.

*Example for a new API:*

```env
# ... (your other keys)
# Get from [https://someservice.com/api](https://someservice.com/api)
SOME_SERVICE_API_KEY=YOUR_KEY_HERE
```

### **Step 2: Add the Variable to `src/config.js`**

Next, open the `src/config.js` file and add a line to load your new variable. This makes it available safely throughout the bot.

*Example:*

```javascript
// Inside src/config.js
const config = {
    // ... (all your other settings)
    DEEPL_API_KEY: process.env.DEEPL_API_KEY || '',
    SOME_SERVICE_API_KEY: process.env.SOME_SERVICE_API_KEY || '', // <-- Add your new line
};
```

### **Step 3: Use the Variable in Your Command**

Now, in your new command file, you can import the `config` object and use the setting. It is **very important** to add a "guard clause" at the beginning to check if the key is present. This prevents the command from crashing and gracefully tells the user that the feature is disabled.

*Example command file `src/commands/tools/newfeature.js`:*

```javascript
// 1. Import the config object
const config = require('../../config');

module.exports = {
    name: 'newfeature',
    category: 'tools',
    description: 'Uses a special API key.',
    emoji: '🌟',
    
    async execute(sock, msg, args, commands) {
        // 2. Add the guard clause at the top
        if (!config.SOME_SERVICE_API_KEY) {
            return await sock.sendMessage(
                msg.key.remoteJid, 
                { text: 'This feature is disabled because the SOME_SERVICE_API_KEY is not set in the .env file.' }, 
                { quoted: msg }
            );
        }

        // 3. Now you can safely use the key in your logic
        const apiKey = config.SOME_SERVICE_API_KEY;
        // ... your command logic that uses the API key ...
        await sock.sendMessage(msg.key.remoteJid, { text: 'New feature is working!' });
    }
};
```

This 3-step pattern ensures that your bot remains stable and provides clear feedback to the user.

```

---

This updated guide now contains everything you need to add any kind of feature to your bot in the future.

We are now truly ready for our final phase. Please let me know when you would like to begin **Phase 20**.
```