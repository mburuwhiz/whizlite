# 1. Use the official Node.js 20 LTS image
FROM node:20-slim

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Install system dependencies required by the bot
#    - ffmpeg is for media conversion
#    - git is for the .update command
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 4. Copy package files and install npm dependencies
COPY package*.json ./
RUN npm install

# 5. Copy the rest of your bot's code into the container
COPY . .

# 6. Command to run when the container starts
CMD ["node", "index.js"]