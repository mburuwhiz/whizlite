<p align="center">
  <img src="https://i.ibb.co/L5rrb2p/whiz-logo-placeholder.png" alt="WHIZLITE Logo" width="180"/>
</p>

<h1 align="center">WHIZLITE</h1>

<p align="center">
  <a href="https://github.com/mburuwhiz"><img title="Author" src="https://img.shields.io/badge/Author-Whiz Tech-blue.svg?style=for-the-badge&logo=github"></a>
</p>

<p align="center">
  <a href="https://github.com/mburuwhiz/whizlite/followers"><img title="Followers" src="https://img.shields.io/github/followers/mburuwhiz?color=purple&style=flat-square"></a>
  <a href="https://github.com/mburuwhiz/whizlite/stargazers/"><img title="Stars" src="https://img.shields.io/github/stars/mburuwhiz/whizlite?color=magenta&style=flat-square"></a>
  <a href="https://github.com/mburuwhiz/whizlite/network/members"><img title="Forks" src="https://img.shields.io/github/forks/mburuwhiz/whizlite?color=purple&style=flat-square"></a>
  <a href="https://github.com/mburuwhiz/whizlite"><img title="Repo Size" src="https://img.shields.io/github/repo-size/mburuwhiz/whizlite?style=flat-square&color=green"></a>
  <a href="https://github.com/mburuwhiz/whizlite/graphs/commit-activity"><img title="Maintained" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square"></a>
</p>

<p align="center">
  <a aria-label="Join our community" href="https://whatsapp.com/channel/0029Vb6W1z3JP20yBZLZs01P" target="_blank">
    <img alt="WhatsApp Channel" src="https://img.shields.io/badge/Join_Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
  </a>
</p>

---

<p align="center">
  <img src="https://profile-counter.glitch.me/mburuwhiz-whizlite/count.svg" alt="Visitor's Count" />
</p>

<p align="center">
  Meet <b>WHIZLITE</b> ✨, your smart, fun, and reliable WhatsApp companion! Built with the latest Baileys technology, WHIZLITE brings a universe of features to your chats—from powerful AI and group moderation to exciting games and media tools. Lightweight, fast, and ready to brighten up your day! 🤖🚀
</p>

<p align="center">
  <a href="https://github.com/mburuwhiz/whizlite/fork"><img title="Fork WHIZLITE" src="https://img.shields.io/badge/FORK_WHIZLITE-100000?style=for-the-badge&logo=shake&logoColor=white"></a>
</p>

## 🚀 Deployment Methods

Getting started with WHIZLITE is easy. Follow these steps.

1.  ### **Prerequisites**
    * **Fork the Repository:** Click the [`FORK`](https://github.com/mburuwhiz/whizlite/fork) button to create your own copy.
    * **Get a Session ID:** This is mandatory for deployment. Visit our session site to get your ID by scanning a QR code.
        <br>
        <a href="https://whizlitesessions.zone.id/" target="_blank"><img alt="SESSION ID" src="https://img.shields.io/badge/GET_SESSION_ID-100000?style=for-the-badge&logo=scan&logoColor=white"></a>
        <br><br>

2.  ### **Deploy to a Hosting Platform**

    <a href="https://render.com/deploy" target="_blank"><img alt="Deploy to Render" src="https://img.shields.io/badge/DEPLOY_TO-RENDER-46E3B7?style=for-the-badge&logo=render"/></a>
    <a href="https://railway.app/new" target="_blank"><img alt="Deploy to Railway" src="https://img.shields.io/badge/DEPLOY_TO-RAILWAY-0B0D0E?style=for-the-badge&logo=railway"/></a>
    <a href="https://heroku.com/deploy?template=https://github.com/mburuwhiz/whizlite" target="_blank"><img alt="Deploy to Heroku" src="https://img.shields.io/badge/DEPLOY_TO-HEROKU-430098?style=for-the-badge&logo=heroku"/></a>
    <a href="https://repl.it/github/mburuwhiz/whizlite" target="_blank"><img alt="Deploy to Replit" src="https://img.shields.io/badge/DEPLOY_TO-REPLIT-F26207?style=for-the-badge&logo=replit"/></a>
    <br><br>

3.  ### **Deploy on Your Own VPS or PC**

    * **Install Required Tools:**
        ```bash
        sudo apt update && sudo apt upgrade -y
        sudo apt install -y git ffmpeg curl
        ```
    * **Install Node.js (v20 LTS):**
        ```bash
        curl -fsSL [https://deb.nodesource.com/setup_20.x](https://deb.nodesource.com/setup_20.x) | sudo -E bash -
        sudo apt install -y nodejs
        ```
    * **Install PM2 (to keep the bot online):**
        ```bash
        sudo npm install -g pm2
        ```
    * **Clone and Install WHIZLITE:**
        ```bash
        git clone [https://github.com/YOUR_USERNAME/whizlite.git](https://github.com/YOUR_USERNAME/whizlite.git)
        cd whizlite
        npm install
        ```
    * **Create Your `.env` File:**
        ```bash
        # Create the file
        touch .env

        # Edit the file with your favorite editor (e.g., nano)
        nano .env
        ```
        Paste your environment variables (like `SESSION_ID`, `OWNER_NUMBER`, etc.) into this file, then save and exit.
    * **Start the Bot:**
        ```bash
        # Start the bot with PM2
        pm2 start index.js --name whizlite

        # To view logs
        pm2 logs whizlite
        ```

---

<h2 align="center">⚠️ Notice</h2>

-   *WHIZLITE is an independent project and is not affiliated with WhatsApp Inc. or Meta.*
-   *Automated accounts can sometimes be flagged by WhatsApp. Using a bot carries a small risk of your number being banned. The owner is not responsible for any such event.*
-   *Please use WHIZLITE responsibly and enjoy the experience!*

---

<p align="center">
  <a href="#top">
    <img src="https://img.shields.io/badge/BACK_TO_TOP-100000?style=for-the-badge">
  </a>
</p>