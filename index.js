require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus,
  StreamType
} = require('@discordjs/voice');

const path = require('path');
const http = require('http');
require('opusscript');
require('libsodium-wrappers');

// Health check
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Single Bot is ready');
}).listen(PORT);

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

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const vc = message.member.voice.channel;

  // JOIN
  if (message.content === '!join1') {
    if (!vc) return message.reply('Voice la join aagu bro');

    connection = joinVoiceChannel({
      channelId: vc.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfDeaf: true
    });

    return message.reply('Joined voice ✅');
  }

  // PLAY
  if (message.content === '!st1') {
    if (!connection) return message.reply('Mudhala !join1 podu');

    const resource = createAudioResource(path.join(__dirname, 'mega_loud.mp3'), {
      inlineVolume: true
    });

    player = createAudioPlayer();
    player.play(resource);
    connection.subscribe(player);

    return message.reply('Audio start (MEGA LOUD) 🔊🌋');
  }

  // STOP
  if (message.content === '!sp1') {
    if (player) player.stop();
  }

  // LEAVE
  if (message.content === '!ds1') {
    if (connection) connection.destroy();
  }
});

client.login(process.env.TOKEN || process.env.TOKEN1)
  .then(() => console.log('Login successful!'))
  .catch(err => console.error('Login failed:', err.message));