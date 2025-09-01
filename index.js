require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const {
  canalWhitelistRespostas,
  cargoRP,
  canalVerificacao,
  rolePT,
  roleES,
  canalPT,
  canalES,
} = require('./config.json');

const token = process.env.token;
if (!token) {
  console.error('[ERRO] Variável de ambiente "token" não encontrada. Configure no Railway em Variables → token');
  process.exit(1);
}

// ====== LOGS/DIAGNÓSTICOS ======
console.log('[BOOT] Iniciando… Node:', process.version);
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,     // precisa do "Server Members Intent" ON no portal
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,   // precisa do "Message Content Intent" ON no portal
  ],
  partials: [Partials.Channel],
});

client.on('error', (e) => console.error('[client.error]', e));
client.on('warn', (w) => console.warn('[client.warn]', w));

// ================ EMBUTIDO: enviarMensagemDeVerificacao =================
async function enviarMensagemDeVerificacao(canal) {
  if (!canal) return;

  // (opcional) deixar o canal só leitura para @everyone sem sobrescrever configs existentes
  try {
    const everyone = canal.guild.roles.everyone;
    const current = canal.permissionOverwrites.cache.get(everyone.id);
    if (!current) {
      await canal.permissionOverwrites.edit(everyone, {
        SendMessages: false,
        AddReactions: false,
      }).catch(() => {});
    }
  } catch (_) {}

  const embed = new EmbedBuilder()
    .setColor('#000000')
    .setTitle('🌐 Selecione seu idioma • Selecciona tu idioma')
    .setDescription([
      'Escolha abaixo para continuar a verificação no seu idioma.',
      'Elige abajo para continuar la verificación en tu idioma.',
    ].join('\n'));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('lang_pt').setLabel('🇧🇷 Português').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('lang_es').setLabel('🇪🇸 Español').setStyle(ButtonStyle.Secondary),
  );

  // evita duplicata: se já existe uma mensagem fixada do bot, atualiza
  try {
    const fetched = await canal.messages.fetch({ limit: 20 }).catch(() => null);
    const antiga = fetched?.find(m =>
      m.pinned &&
      m.author?.bot &&
      m.embeds?.[0]?.title?.includes('Selecione seu idioma')
    );
    if (antiga) {
      await antiga.edit({ embeds: [embed], components: [row] }).catch(() => {});
      return;
    }
  } catch (_) {}

  const msg = await canal.send({ embeds: [embed], components: [row] });
  try { await msg.pin(); } catch (_) {}
}
// ================== FIM EMBUTIDO ===================


client.once('clientReady', async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag} (id: ${client.user.id})`);

  try {
    await client.user.setPresence({
      activities: [{ name: 'Black • verificação' }],
      status: 'online',
    });
    console.log('🟢 Presença definida.');
  } catch (err) {
    console.error('Erro ao definir presença:', err);
  }

  try {
    const ch = await client.channels.fetch(canalVerificacao);
    await enviarMensagemDeVerificacao(ch);
    console.log('📌 Mensagem de verificação enviada/fixada.');
  } catch (err) {
    console.error('Erro ao enviar mensagem de verificação:', err);
  }
});

/* ============ (aqui entram seus outros handlers de interação) ============
   Se você tem os fluxos de WL/PT/ES, RP/PVE, etc., mantenha-os abaixo,
   exatamente como estavam — não precisam do utils/verificacao agora.
   ======================================================================= */

// ====== LOGIN ======
(async () => {
  console.log('[LOGIN] Tentando logar...');
  try {
    await client.login(token);
    console.log('[LOGIN] Sucesso. Aguardando clientReady...');
  } catch (e) {
    console.error('[LOGIN ERRO] Não foi possível logar:', e);
    process.exit(1);
  }
})();
