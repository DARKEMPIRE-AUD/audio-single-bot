const { Client, GatewayIntentBits } = require('discord.js');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus
} = require('@discordjs/voice');

const path = require('path');
const http = require('http');
require('ffmpeg-static');

// Health check and Keep-alive for Render
const PORT = process.env.PORT || 8080;
const appUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running');
}).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log('Checking Token...');
  if (process.env.TOKEN) {
    console.log(`Token found! (Starts with: ${process.env.TOKEN.substring(0, 5)}...)`);
  } else {
    console.log('ERROR: TOKEN not found in Environment Variables!');
  }
  
  // Self-ping to stay awake
  setInterval(() => {
    const protocol = appUrl.startsWith('https') ? require('https') : require('http');
    protocol.get(appUrl, (res) => {
      console.log('Self-ping successful');
    }).on('error', (err) => {
      console.error('Self-ping failed:', err.message);
    });
  }, 10 * 60 * 1000); // 10 minutes
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

let connection;
let player;

client.on('ready', () => {
  console.log('Bot ready 🔥');
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('error', (error) => {
  console.error('Discord Client Error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

client.on('messageCreate', message => {

  if (message.author.bot) return;

  const vc = message.member.voice.channel;

  // JOIN
  if (message.content === '!join1') {
    if (!vc) return message.reply('Voice la join aagu');

    connection = joinVoiceChannel({
      channelId: vc.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    return message.reply('Joined voice ✅');
  }

  // PLAY
  if (message.content === '!st1') {

    if (!connection) {
      return message.reply('Mudhala !join1 podu');
    }

    const resource = createAudioResource(path.join(__dirname, 'new.mp3'));

    player = createAudioPlayer();

    player.on(AudioPlayerStatus.Playing, () => {
      console.log('Audio started 🔊');
    });

    player.play(resource);
    connection.subscribe(player);

    return message.reply('Audio start 🔊');
  }

  // STOP
  if (message.content === '!sp1') {
    if (player) player.stop();
  }

  // DISCONNECT
  if (message.content === '!ds1') {
    if (connection) connection.destroy();
  }

});

client.login(process.env.TOKEN);