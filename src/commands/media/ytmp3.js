const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

module.exports = {
    name: 'ytmp3',
    category: 'media',
    description: 'Downloads the audio from a YouTube video.',
    emoji: '🎵',
    async execute(sock, msg, args) {
        if (!args.length || !ytdl.validateURL(args[0])) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a valid YouTube video URL.' }, { quoted: msg });
        }
        
        const url = args[0];
        const spinner = await sock.sendMessage(msg.key.remoteJid, { text: 'Downloading and converting audio... ⏳' }, { quoted: msg });

        try {
            const info = await ytdl.getInfo(url);
            const videoLength = parseInt(info.videoDetails.lengthSeconds);

            if (videoLength > 600) { // Limit to 10 minutes (600 seconds)
                return await sock.sendMessage(msg.key.remoteJid, { text: '❌ Video is too long! Please use a video under 10 minutes.', edit: spinner.key });
            }

            const title = info.videoDetails.title.replace(/[<>:"/\\|?*]+/g, ''); // Sanitize title
            const outputPath = path.join(__dirname, `../../../temp_${title}.mp3`);

            const stream = ytdl(url, { quality: 'highestaudio' });

            ffmpeg(stream)
                .audioBitrate(128)
                .save(outputPath)
                .on('end', async () => {
                    await sock.sendMessage(msg.key.remoteJid, {
                        audio: { url: outputPath },
                        mimetype: 'audio/mpeg'
                    }, { quoted: msg });

                    fs.unlinkSync(outputPath); // Clean up the file
                    await sock.sendMessage(msg.key.remoteJid, { delete: spinner.key });
                })
                .on('error', async (err) => {
                    console.error('FFMPEG Error:', err);
                    fs.unlinkSync(outputPath);
                    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to convert the audio.', edit: spinner.key });
                });
        } catch (e) {
            console.error('YTDL Error:', e);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ An error occurred while fetching the video information.', edit: spinner.key });
        }
    }
};