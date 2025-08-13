const axios = require('axios');
const config = require('../../config');

module.exports = {
    name: 'weather',
    category: 'tools',
    description: 'Gets the current weather for a specified city.',
    emoji: '🌦️',
    async execute(sock, msg, args) {
        if (!config.OPENWEATHER_API_KEY) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'The OpenWeatherMap API key is not set. This command is disabled.' }, { quoted: msg });
        }
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a city name. Example: .weather Nairobi' }, { quoted: msg });
        }

        const city = args.join(' ');
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${config.OPENWEATHER_API_KEY}&units=metric`;

        try {
            const response = await axios.get(url);
            const data = response.data;
            
            const weatherIcons = {
                'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️',
                'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️', 'Haze': '🌫️'
            };

            const weatherText = `
*Weather in ${data.name}, ${data.sys.country}*

› *Condition:* ${data.weather[0].main} ${weatherIcons[data.weather[0].main] || ''}
› *Description:* ${data.weather[0].description}
› *Temperature:* ${data.main.temp}°C
› *Feels Like:* ${data.main.feels_like}°C
› *Humidity:* ${data.main.humidity}%
› *Wind Speed:* ${data.wind.speed} m/s
            `.trim();

            await sock.sendMessage(msg.key.remoteJid, { text: weatherText }, { quoted: msg });
        } catch (error) {
            console.error('Weather API error:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: `Could not find weather information for "${city}". Please check the spelling.` }, { quoted: msg });
        }
    }
};