
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = {
  token: process.env.token,
  clientId: process.env.clientId,
  guildId: process.env.guildId
};

const commands = [
  new SlashCommandBuilder().setName('whitelist').setDescription('Iniciar whitelist para o servidor RP.'),
  new SlashCommandBuilder().setName('pve').setDescription('Cadastrar Steam ID para acesso ao servidor PVE.')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('🚀 Registrando comandos...');
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    );
    console.log('✅ Comandos registrados!');
  } catch (error) {
    console.error(error);
  }
})();
