const { YoutubeTranscript } = require('youtube-transcript');
const { OpenAI } = require('openai');
const config =require('../../config');
const ytdl = require('ytdl-core');

module.exports = {
    name: 'ytsummary',
    category: 'media',
    description: 'Summarizes a YouTube video using its transcript.',
    emoji: '📝',
    async execute(sock, msg, args) {
        if (!config.OPENAI_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The OpenAI API key is not set. This command is disabled.' }, { quoted: msg });
        }
        if (!args.length || !ytdl.validateURL(args[0])) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a valid YouTube video URL.' }, { quoted: msg });
        }
        
        const url = args[0];
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Fetching transcript and generating summary... 🧠' }, { quoted: msg });

        try {
            // 1. Fetch Transcript
            const transcriptData = await YoutubeTranscript.fetchTranscript(url);
            if (!transcriptData || transcriptData.length === 0) {
                return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Could not find a transcript for this video.', edit: spinner.key });
            }
            
            const transcript = transcriptData.map(item => item.text).join(' ');

            // 2. Summarize with OpenAI
            const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that summarizes YouTube video transcripts concisely.' },
                    { role: 'user', content: `Please provide a brief summary of the following transcript:\n\n"${transcript.substring(0, 12000)}"` } // Limit transcript length to avoid API limits
                ],
            });

            const summary = completion.choices[0].message.content;
            const videoInfo = await ytdl.getInfo(url);

            const summaryText = `
*Summary for "${videoInfo.videoDetails.title}"*

${summary}
            `.trim();

            await sock.sendMessage(msg.key.remoteJid, { text: summaryText, edit: spinner.key });

        } catch (e) {
            console.error('YT Summary Error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ An error occurred. The video might not have a transcript or there was an issue with the AI model.', edit: spinner.key });
        }
    }
};