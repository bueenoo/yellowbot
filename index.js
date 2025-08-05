
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const token = process.env.token;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'verificar_rp') {
    try {
      await interaction.reply({
        content: '📄 Vá até o canal <#1401950755031748628> e siga as instruções para preencher sua whitelist com base na história do servidor.',
        ephemeral: true
      });
    } catch (err) {
      console.error('Erro ao processar RP:', err);
    }
  }

  if (interaction.customId === 'verificar_pve') {
    try {
      await interaction.reply({
        content: '⚔️ Vá até o canal <#1401951160629461002> e envie sua Steam ID para cadastro.',
        ephemeral: true
      });
    } catch (err) {
      console.error('Erro ao processar PVE:', err);
    }
  }
});

client.login(token);
