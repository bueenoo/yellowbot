require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  Events
} = require('discord.js');

const {
  canalVerificacao
} = require('./config.json');

// Utils de verificação (PT/ES)
let enviarMensagemDeVerificacao = null;
let onVerificacaoInteraction = null;
try {
  const moduloVerificacao = require('./utils/verificacao');
  enviarMensagemDeVerificacao = moduloVerificacao.enviarMensagemDeVerificacao;
  onVerificacaoInteraction = moduloVerificacao.onInteraction || moduloVerificacao.handleInteraction;
} catch (e) {
  console.warn('[WARN] utils/verificacao não encontrado ou sem export esperado. Pular envio automático.');
}

// Tickets (PT/ES) com botão de fechar e transcript
let initTicketsUI = null;
let onTicketInteraction = null;
try {
  const moduloTickets = require('./tickets');
  initTicketsUI = moduloTickets.init || moduloTickets.initTicketsUI || moduloTickets.setup;
  onTicketInteraction = moduloTickets.onInteraction || moduloTickets.handleInteraction;
} catch (e) {
  console.warn('[WARN] tickets não encontrado ou sem export esperado. Pular UI de tickets.');
}

const token = process.env.token || process.env.TOKEN || process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ TOKEN ausente. Defina a variável de ambiente "token" (ou TOKEN / DISCORD_TOKEN).');
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

  // Presença
  try {
    client.user.setPresence({
      activities: [{ name: 'Black • verificação' }],
      status: 'online'
    });
  } catch (err) {
    console.warn('⚠️ Não foi possível definir presença:', err?.message || err);
  }

  // Enviar mensagem de verificação (PT/ES) fixada no canal configurado
  if (typeof enviarMensagemDeVerificacao === 'function') {
    try {
      await enviarMensagemDeVerificacao(client, canalVerificacao);
      console.log('📌 Mensagem de idioma enviada/fixada.');
    } catch (err) {
      console.error('❌ Falha ao enviar mensagem de idioma:', err);
    }
  }

  // Inicializar UI de tickets (PT/ES) se existir
  if (typeof initTicketsUI === 'function') {
    try {
      await initTicketsUI(client);
      console.log('🎫 UI de tickets inicializada.');
    } catch (err) {
      console.error('❌ Falha ao inicializar UI de tickets:', err);
    }
  }
});

// Router de interações (evita duplicações; chama cada handler se existir)
client.on(Events.InteractionCreate, async (interaction) => {
  // Verificação (idioma, RP/PVE, WL…) 
  if (typeof onVerificacaoInteraction === 'function') {
    try {
      const handled = await onVerificacaoInteraction(interaction, client);
      if (handled) return;
    } catch (err) {
      console.error('Erro no handler de verificação:', err);
    }
  }

  // Tickets (PT/ES + fechar + transcript)
  if (typeof onTicketInteraction === 'function') {
    try {
      const handled = await onTicketInteraction(interaction, client);
      if (handled) return;
    } catch (err) {
      console.error('Erro no handler de tickets:', err);
    }
  }
});

console.log('[LOGIN] Tentando logar...');
client.login(token)
  .then(() => console.log('[LOGIN] Sucesso. Aguardando clientReady...'))
  .catch((e) => {
    console.error('❌ Falha no login (token inválido?):', e?.message || e);
    process.exit(1);
  });
