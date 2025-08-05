
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');
const { enviarMensagemDeVerificacao } = require('./utils/mensagemVerificacao');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers],
  partials: [Partials.Channel]
});

client.once('ready', async () => {
  console.log('Bot atualizado iniciado com sucesso!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'verificar_rp') {
    try {
      await interaction.reply({ content: '📄 Vá até o canal <#1401950755031748628> e siga as instruções para preencher sua whitelist com base na história do servidor.', ephemeral: true });
    } catch (err) {
      console.error('Erro ao processar RP:', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❗ Ocorreu um erro ao processar sua escolha.', ephemeral: true });
      }
    }
  }

  if (interaction.customId === 'verificar_pve') {
    try {
      await interaction.reply({ content: '⚔️ Vá até o canal <#1401951160629461002> e envie sua Steam ID para cadastro.', ephemeral: true });
    } catch (err) {
      console.error('Erro ao processar PVE:', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❗ Ocorreu um erro ao processar sua escolha.', ephemeral: true });
      }
    }
  }
});

client.login(token);
