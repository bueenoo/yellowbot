require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [];
const commandsDir = path.join(__dirname, 'commands');
if (fs.existsSync(commandsDir)) {
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const cmd = require(path.join(commandsDir, file));
    if (cmd?.data?.toJSON) commands.push(cmd.data.toJSON());
  }
}

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.log('⚠️ TOKEN/CLIENT_ID/GUILD_ID ausentes — pulando deploy sem erro.');
  process.exit(0);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(`⏳ Registrando ${commands.length} comando(s) em guild ${GUILD_ID}...`);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('✅ Comandos registrados com sucesso!');
  } catch (err) {
    console.error('❌ Falha ao registrar comandos.');
    console.error('status:', err?.status);
    console.error('code:', err?.code);
    console.error('rawError:', err?.rawError);
    console.error(err);
    process.exit(1);
  }
})();
