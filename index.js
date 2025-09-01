
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const cfg = require('./config.json');
const { enviarMensagemDeVerificacao, handleVerificationInteractions } = require('./utils/verificacao');
const { enviarMensagemDeTickets } = require('./utils/tickets');
const { abrirTicket } = require('./utils/ticketHandler');

const token = process.env.token;
if (!token) { console.error("Env var 'token' faltando"); process.exit(1); }

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once('clientReady', async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag} (id: ${client.user.id})`);
  try {
    const ch = await client.channels.fetch(cfg.canalVerificacao);
    if (ch) await enviarMensagemDeVerificacao(ch, { rolePT: cfg.rolePT, roleES: cfg.roleES });
  } catch (e) { console.error("Falha verificação:", e.message); }

  try {
    const chT = await client.channels.fetch(cfg.canalAbrirTicket);
    if (chT) await enviarMensagemDeTickets(chT);
  } catch (e) { console.error("Falha tickets:", e.message); }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton() || interaction.isModalSubmit()) {
    // Tickets
    if (interaction.isButton()) {
      if (interaction.customId === 'ticket_doacoes')  return abrirTicket(interaction, 'doacoes', cfg);
      if (interaction.customId === 'ticket_denuncia') return abrirTicket(interaction, 'denuncia', cfg);
      if (interaction.customId === 'ticket_suporte')  return abrirTicket(interaction, 'suporte', cfg);
    }
    // Verificação/WL/PVE
    return handleVerificationInteractions(interaction, cfg);
  }
});

client.login(token);
