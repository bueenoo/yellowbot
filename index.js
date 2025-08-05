const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
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
const steamHandler = require('./steam-handler');

const token = process.env.token;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
  console.log(`✅ Blackbot está online como ${client.user.tag}`);
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
  if (interaction.isButton()) {
    if (interaction.customId === 'verificar_rp') {
      await interaction.reply({ content: '📋 Vá até o canal de whitelist e siga as instruções para RP.', ephemeral: true });
    }
    if (interaction.customId === 'verificar_pve') {
      const canalPVE = await interaction.guild.channels.fetch("1401951160629461002");
      await interaction.reply({ content: `⚔️ Vá para ${canalPVE.toString()} e envie sua Steam ID para cadastro.`, ephemeral: true });
    }
  }

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❗ Ocorreu um erro ao executar este comando.', ephemeral: true });
    }
  }
});

client.on('messageCreate', message => {
  steamHandler(client, message);
});

ticketHandler(client);
client.login(token);
