const chalk = require('chalk');
const boxen = require('boxen');
const Table = require('cli-table3');
const config = require('../config');

const showBanner = () => {
    // Custom ASCII Art Banner
    const banner = `
 __        __  _   _   ___   _____    _       ___   _____   _____
 \\ \\      / / | | | | |_ _| |__  /   | |     |_ _| |_   _| | ____|
  \\ \\ /\\ / /  | |_| |  | |    / /    | |      | |    | |   |  _|
   \\ V  V /   |  _  |  | |   / /_    | |___   | |    | |   | |___
    \\_/\\_/    |_| |_| |___| /____|   |_____| |___|   |_|   |_____|
    `;
    console.log(gradient.pastel.multiline(banner));

    const boxText = 
`Powered by Whiz Tech
Visit whiz.zone.id for better deals
The ultimate WhatsApp automation experience.`;

    console.log(boxen(boxText, {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'blue',
        textAlignment: 'center'
    }));
};

const checkConfiguration = () => {
    console.log(chalk.green('\n√ Whiz Lite Initialized Correctly!'));
    
    const table = new Table({
        head: [chalk.cyan('Configuration'), chalk.cyan('Status')],
        colWidths: [30, 40]
    });

    const isOwnerSet = !!config.OWNER_NUMBER;
    const isSessionSet = !!config.SESSION_ID;

    table.push(
        ['Owner Number', isOwnerSet ? `✔ Set (${config.OWNER_NUMBER})` : chalk.red('✘ Not Set')],
        ['Session Method', isSessionSet ? '✔ Session ID' : chalk.yellow('ⓘ Using QR Scan')]
    );
    
    console.log(table.toString());

    return isOwnerSet;
};

// We need to re-add gradient-string to our imports at the top
const gradient = require('gradient-string');

module.exports = { showBanner, checkConfiguration };