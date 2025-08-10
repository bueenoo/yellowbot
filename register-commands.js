const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

async function registerGuildCommands() {
  const TOKEN = process.env.TOKEN;
  const CLIENT_ID = process.env.CLIENT_ID;
  const GUILD_ID = process.env.GUILD_ID;

  if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.log('⚠️ TOKEN/CLIENT_ID/GUILD_ID ausentes — pulando registro automático.');
    return;
  }

  const commands = [];
  const commandsDir = path.join(__dirname, 'commands');
  if (fs.existsSync(commandsDir)) {
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const cmd = require(path.join(commandsDir, file));
      if (cmd?.data?.toJSON) commands.push(cmd.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  console.log(`⏳ Registrando ${commands.length} comando(s) em guild ${GUILD_ID}...`);
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  console.log('✅ Comandos registrados com sucesso!');
}

module.exports = { registerGuildCommands };
