const { Client, GatewayIntentBits } = require('discord.js');
const {
  clientId,
  guildId,
  cargoRP,
  cargoPVE,
  canalVerificacao,
  canalWhitelistRespostas,
  categoriaTickets
} = require('./config.json');
const { enviarMensagemDeTicket } = require('./ticket-message');
const { enviarMensagemDeVerificacao } = require('./verificacao');
const ticketHandler = require('./tickets');

const token = process.env.token; // Token via variável de ambiente

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

  try {
    const canalTickets = await client.channels.fetch(canalWhitelistRespostas);
    enviarMensagemDeTicket(canalTickets);

    const canalVerificacaoFinal = await client.channels.fetch(canalVerificacao);
    enviarMensagemDeVerificacao(canalVerificacaoFinal);
  } catch (err) {
    console.error("Erro ao enviar mensagens iniciais:", err);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'verificar_entrada') {
    const role = interaction.guild.roles.cache.get("1401249121523859456"); // Cargo Sobrevivente RP
    if (!role) return interaction.reply({ content: '❗ Cargo não encontrado.', ephemeral: true });

    try {
      await interaction.member.roles.add(role);
      await interaction.reply({ content: '✅ Você agora tem acesso ao servidor. Bem-vindo ao Yellowstone!', ephemeral: true });
    } catch (err) {
      console.error("Erro ao adicionar cargo:", err);
      await interaction.reply({ content: '❗ Não foi possível atribuir o cargo.', ephemeral: true });
    }
  }
});

ticketHandler(client);
client.login(token);