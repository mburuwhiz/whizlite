const { getFaqs, addFaq, deleteFaq } = require('../../utils/dbHandler');
const config = require('../../config');

module.exports = {
    name: 'faq',
    category: 'tools',
    description: 'Manages and displays Frequently Asked Questions.',
    emoji: '❓',
    async execute(sock, msg, args) {
        const subCommand = args[0]?.toLowerCase();
        const isOwner = msg.key.remoteJid.split('@')[0] === config.OWNER_NUMBER;

        switch (subCommand) {
            case 'add':
                if (!isOwner) return;
                const content = args.slice(1).join(' ');
                const [question, answer] = content.split('|').map(s => s.trim());
                if (!question || !answer) return await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: .faq add <question> | <answer>' });
                addFaq(question, answer);
                await sock.sendMessage(msg.key.remoteJid, { text: 'FAQ added successfully.' });
                break;

            case 'del':
            case 'delete':
                if (!isOwner) return;
                const index = parseInt(args[1]) - 1;
                if (isNaN(index)) return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a valid FAQ number to delete.' });
                if (deleteFaq(index)) {
                    await sock.sendMessage(msg.key.remoteJid, { text: `FAQ #${index + 1} deleted.` });
                } else {
                    await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid FAQ number.' });
                }
                break;
            
            case 'list':
            default:
                const faqs = getFaqs();
                if (faqs.length === 0) return await sock.sendMessage(msg.key.remoteJid, { text: 'No FAQs have been set yet.' });
                
                let faqList;
                if (!isNaN(parseInt(subCommand))) {
                    const faqIndex = parseInt(subCommand) - 1;
                    if (faqs[faqIndex]) {
                        faqList = `*❓ Q: ${faqs[faqIndex].question}*\n\n*💬 A:* ${faqs[faqIndex].answer}`;
                    } else {
                        faqList = 'Invalid FAQ number.';
                    }
                } else {
                    faqList = '*Frequently Asked Questions*\n\n';
                    faqs.forEach((faq, i) => {
                        faqList += `${i + 1}. ${faq.question}\n`;
                    });
                    faqList += '\nUse `.faq <number>` to read an answer.';
                }
                await sock.sendMessage(msg.key.remoteJid, { text: faqList });
                break;
        }
    }
};