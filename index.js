
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { ticketHandler } = require('./tickets');
const { enviarMensagemDeTicket } = require('./ticket-message');
const { enviarMensagemDeVerificacao } = require('./verificacao');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', async () => {
  console.log(`✅ Yellowbot está online como ${client.user.tag}`);

  const canalTickets = await client.channels.fetch('1401951520114737193');
  enviarMensagemDeTicket(canalTickets);

  const canalVerificacao = await client.channels.fetch('1401950478761332776');
  enviarMensagemDeVerificacao(canalVerificacao);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'verificar_entrada') {
    const role = interaction.guild.roles.cache.get("1401249121523859456"); // ID do cargo
    if (!role) return interaction.reply({ content: '❗ Cargo não encontrado.', ephemeral: true });

    await interaction.member.roles.add(role);
    await interaction.reply({ content: '✅ Você agora tem acesso ao servidor. Bem-vindo ao Yellowstone!', ephemeral: true });
  }
});

ticketHandler(client);
client.login(token);
