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

// 🔄 Carregar comandos de barra (slash)
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

// 🎯 Lidar com interações (botões e comandos)
client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    const member = interaction.member;

    if (interaction.customId === 'entrar_rp') {
      const role = interaction.guild.roles.cache.get(cargoRP);
      if (!role) return interaction.reply({ content: '❗ Cargo RP não encontrado.', ephemeral: true });

      try {
        await member.roles.add(role);
        await interaction.reply({ content: '🎭 Você agora tem acesso à whitelist RP! Acesse o canal de inscrição.', ephemeral: true });
      } catch (err) {
        console.error("Erro ao adicionar cargo RP:", err);
        await interaction.reply({ content: '❗ Não foi possível atribuir o cargo RP.', ephemeral: true });
      }
    }

    if (interaction.customId === 'entrar_pve') {
      try {
        const canalCadastro = await interaction.guild.channels.fetch('1401951160629461002');
        await interaction.reply({ content: `⚔️ Vá até o canal <#1401951160629461002> e envie sua Steam ID para liberar o acesso.`, ephemeral: true });
        await canalCadastro.permissionOverwrites.edit(member.id, {
          ViewChannel: true,
          SendMessages: true
        });
      } catch (err) {
        console.error("Erro ao liberar canal Steam ID:", err);
        await interaction.reply({ content: '❗ Não foi possível liberar o canal de cadastro PVE.', ephemeral: true });
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
      await interaction.reply({ content: '❗ Ocorreu um erro ao executar este comando.', ephemeral: true });
    }
  }
});

ticketHandler(client);
client.login(token);
