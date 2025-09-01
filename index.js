require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
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

const { enviarMensagemDeVerificacao } = require('./utils/verificacao');

const token = process.env.token;
if (!token) {
  console.error('[ERRO] Variável de ambiente "token" não encontrada. Configure no Railway em Variables → token');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));

client.on('error', (e) => console.error('[client.error]', e));
client.on('warn', (w) => console.warn('[client.warn]', w));

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

(async () => {
  console.log('[LOGIN] Tentando logar...');
  try {
    await client.login(token);
    console.log('[LOGIN] Sucesso. Aguardando clientReady...');
  } catch (err) {
    console.error('[LOGIN ERRO]', err);
    process.exit(1);
  }
})();
