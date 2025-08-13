const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ytmp4',
    category: 'media',
    description: 'Downloads a YouTube video.',
    emoji: '📹',
    async execute(sock, msg, args) {
        if (!args.length || !ytdl.validateURL(args[0])) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a valid YouTube video URL.' }, { quoted: msg });
        }
        
        const url = args[0];
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Downloading video... ⏳' }, { quoted: msg });

        try {
            const info = await ytdl.getInfo(url);
            const videoLength = parseInt(info.videoDetails.lengthSeconds);

            if (videoLength > 600) { // Limit to 10 minutes (600 seconds)
                return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Video is too long! Please use a video under 10 minutes.', edit: spinner.key });
            }
            
            // Choose a format that is likely under 16MB. '18' is a common 360p mp4 format.
            const format = ytdl.chooseFormat(info.formats, { quality: '18' });
            if (!format) {
                return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Could not find a suitable format to download.', edit: spinner.key });
            }

            const title = info.videoDetails.title.replace(/[<>:"/\\|?*]+/g, ''); // Sanitize title
            const outputPath = path.join(__dirname, `../../../temp_${title}.mp4`);
            
            const videoStream = ytdl(url, { format });
            
            videoStream.pipe(fs.createWriteStream(outputPath)).on('finish', async () => {
                await sock.sendMessage(msg.key.remoteJid, {
                    video: { url: outputPath },
                    caption: `*${info.videoDetails.title}*`
                }, { quoted: msg });

                fs.unlinkSync(outputPath); // Clean up the file
                await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
            });
        } catch (e) {
            console.error('YTDL Error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ An error occurred while fetching the video.', edit: spinner.key });
        }
    }
};