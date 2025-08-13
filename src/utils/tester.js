const chalk = require('chalk');
const boxen = require('boxen');
const figlet = require('figlet');
const gradient = require('gradient-string');
const ora = require('ora');
const cliProgress = require('cli-progress');
const Table = require('cli-table3');

const showBanner = () => {
    const bannerText = figlet.textSync('WHIZ LITE', {
        font: 'Standard',
        horizontalLayout: 'full',
    });

    console.log(gradient.pastel.multiline(bannerText));
    console.log(boxen(
        chalk.green('Powered by Whiz Tech') + '\n' +
        chalk.blueBright('Visit whiz.zone.id for better deals') + '\n' +
        chalk.cyan('The ultimate WhatsApp automation experience.'), {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'blue'
        }
    ));
};

const checkConfiguration = async (config) => {
    console.log('\n');
    const spinner = ora(chalk.yellow('Verifying Configuration...')).start();
    await new Promise(resolve => setTimeout(resolve, 1000));

    const table = new Table({
        head: [chalk.cyan('Configuration'), chalk.cyan('Status')],
        colWidths: [30, 40]
    });

    const isOwnerSet = !!config.OWNER_NUMBER;
    const isSessionSet = !!config.SESSION_ID;

    table.push(
        ['Owner Number', isOwnerSet ? chalk.green(`✔ Set (${config.OWNER_NUMBER})`) : chalk.red('✘ Not Set')],
        ['Session Method', isSessionSet ? chalk.green('✔ Session ID') : chalk.yellow('ⓘ Using QR Scan')]
    );
    
    spinner.succeed(chalk.green('Whiz Lite Initialized Correctly!'));
    console.log(table.toString());

    return isOwnerSet;
};

module.exports = { showBanner, checkConfiguration };