require('dotenv').config();

const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const { canalVerificacao } = require('./config.json');

// Import verificacao (PT/ES)
const { enviarMensagemDeVerificacao, onInteraction: onVerificacaoInteraction } = require('./utils/verificacao');
// Import tickets (PT/ES)
const { init: initTicketsUI, onInteraction: onTicketInteraction } = require('./tickets');

const token = process.env.token || process.env.TOKEN || process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ TOKEN ausente. Configure nas variáveis do Railway.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User]
});

client.once(Events.ClientReady, async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag} (id: ${client.user.id})`);

  try {
    client.user.setPresence({
      activities: [{ name: 'Black • verificação' }],
      status: 'online'
    });
  } catch (err) {
    console.warn('⚠️ Não foi possível definir presença:', err.message);
  }

  // Enviar mensagem de idioma/verificação
  try {
    await enviarMensagemDeVerificacao(client, canalVerificacao);
    console.log('📌 Mensagem de idioma enviada/fixada.');
  } catch (err) {
    console.error('❌ Falha ao enviar mensagem de idioma:', err.message);
  }

  // Inicializar tickets
  try {
    await initTicketsUI(client);
    console.log('🎫 UI de tickets inicializada.');
  } catch (err) {
    console.error('❌ Falha ao inicializar tickets:', err.message);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (onVerificacaoInteraction) {
    try {
      const handled = await onVerificacaoInteraction(interaction, client);
      if (handled) return;
    } catch (err) {
      console.error('Erro em interação de verificação:', err);
    }
  }
  if (onTicketInteraction) {
    try {
      const handled = await onTicketInteraction(interaction, client);
      if (handled) return;
    } catch (err) {
      console.error('Erro em interação de ticket:', err);
    }
  }
});

console.log('[LOGIN] Tentando logar...');
client.login(token).then(() => console.log('[LOGIN] Sucesso.')).catch((e) => {
  console.error('❌ Falha no login:', e.message);
  process.exit(1);
});