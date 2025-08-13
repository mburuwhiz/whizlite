const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'currency',
    category: 'tools',
    description: 'Converts an amount from one currency to another.',
    emoji: '💹',
    async execute(sock, msg, args) {
        if (!config.CURRENCY_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The ExchangeRate-API key is not set. This command is disabled.' }, { quoted: msg });
        }
        if (args.length < 4 || args[2].toLowerCase() !== 'to') {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid format. Use: .currency <amount> <FROM> to <TO>\n*Example:* .currency 100 USD to KES' }, { quoted: msg });
        }

        const amount = parseFloat(args[0]);
        const fromCurrency = args[1].toUpperCase();
        const toCurrency = args[3].toUpperCase();

        if (isNaN(amount)) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid amount provided.' }, { quoted: msg });
        }

        const url = `https://v6.exchangerate-api.com/v6/${config.CURRENCY_API_KEY}/pair/${fromCurrency}/${toCurrency}/${amount}`;
        
        try {
            const response = await axios.get(url);
            const data = response.data;

            if (data.result === 'success') {
                const resultText = `
*Currency Conversion*

› *From:* ${amount} ${fromCurrency}
› *To:* ${data.conversion_result.toFixed(2)} ${toCurrency}
› *Rate:* 1 ${fromCurrency} = ${data.conversion_rate} ${toCurrency}
                `.trim();
                await sock.sendMessage(msg.key.remoteJid, { text: resultText }, { quoted: msg });
            } else {
                throw new Error(data['error-type'] || 'Unknown error');
            }
        } catch (error) {
            console.error('Currency API error:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: `Could not perform conversion. Please check if the currency codes "${fromCurrency}" and "${toCurrency}" are valid.` }, { quoted: msg });
        }
    }
};