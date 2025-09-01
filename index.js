require('dotenv').config();
const { Client, GatewayIntentBits, Partials, MessageFlags } = require('discord.js');
const cfg = require('./config.json');
const { enviarMensagemDeVerificacao } = require('./utils/verificacao'); // já existente no seu projeto
const { giveLangRoleAndGuide } = require('./utils/lang-roles');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once('clientReady', async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag} (id: ${client.user.id})`);
  try {
    await enviarMensagemDeVerificacao(client, cfg.canalVerificacao);
  } catch (e) {
    console.error('Falha ao enviar mensagem de verificação:', e);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  // Seleção de idioma
  if (interaction.customId === 'lang_pt') {
    return giveLangRoleAndGuide(interaction, 'pt', cfg);
  }
  if (interaction.customId === 'lang_es') {
    return giveLangRoleAndGuide(interaction, 'es', cfg);
  }
});

client.login(process.env.token);
