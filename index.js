// Conteúdo atualizado do index.js (vindo da última versão validada)
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
    if (interaction.customId === 'verificar_entrada') {
      const role = interaction.guild.roles.cache.get("1401249121523859456");
      if (!role) return interaction.reply({ content: '❗ Cargo não encontrado.', flags: 64 });

      try {
        await interaction.member.roles.add(role);
        await interaction.reply({ content: '✅ Você agora tem acesso ao servidor. Bem-vindo ao Black!', flags: 64 });
      } catch (err) {
        console.error("Erro ao adicionar cargo:", err);
        await interaction.reply({ content: '❗ Não foi possível atribuir o cargo.', flags: 64 });
      }
    }
  }

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❗ Ocorreu um erro ao executar este comando.', flags: 64 });
    }
  }
});

ticketHandler(client);
client.login(token);