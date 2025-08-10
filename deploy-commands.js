// deploy-commands.js
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.TOKEN; // use maiúsculo
const { clientId: CLIENT_ID, guildId: GUILD_ID } = require('./config.json');

if (!TOKEN) throw new Error('TOKEN ausente (defina em .env ou no host).');
if (!CLIENT_ID) throw new Error('clientId ausente em config.json.');
if (!GUILD_ID) throw new Error('guildId ausente em config.json.');

const commands = [];
const commandsDir = path.join(__dirname, 'commands');
if (!fs.existsSync(commandsDir)) {
  console.warn('⚠️ Pasta ./commands não existe. Registrando lista vazia.');
} else {
  const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const cmd = require(path.join(commandsDir, file));
    if (!cmd?.data?.toJSON) {
      console.warn(`⚠️ ${file} não exporta data.toJSON(). Pulando.`);
      continue;
    }
    commands.push(cmd.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(`⏳ Registrando ${commands.length} comando(s) em guild ${GUILD_ID}...`);
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );
    console.log('✅ Comandos registrados com sucesso!');
  } catch (err) {
    // Logs úteis pra debug de 401/403
    console.error('❌ Falha ao registrar comandos.');
    console.error('status:', err?.status);
    console.error('code:', err?.code);
    console.error('rawError:', err?.rawError);
    console.error(err);
    process.exit(1);
  }
})();
