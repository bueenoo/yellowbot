
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const { ticketHandler } = require('./tickets');

const config = {
  token: process.env.token,
  clientId: process.env.clientId,
  guildId: process.env.guildId,
  cargoRP: process.env.cargoRP,
  cargoPVE: process.env.cargoPVE,
  canalWhitelistRespostas: process.env.canalWhitelistRespostas,
  categoriaTickets: process.env.categoriaTickets
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel]
});

client.once('ready', () => {
  console.log(`✅ Yellowbot está online como ${client.user.tag}`);
  const { enviarMensagemDeTicket } = require('./ticket-message');
  const canal = client.channels.cache.get(process.env.canalTicketMsg || "");
  if (canal) enviarMensagemDeTicket(canal);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'whitelist') {
    const questions = [
      'Qual seu nome?',
      'Qual sua idade?',
      'Qual seu Steam ID?',
      'Qual sua experiência com RP?',
      'Escreva uma breve história (até 200 caracteres) baseada na lore do servidor.'
    ];

    const respostas = [];
    const user = interaction.user;

    let dm = await user.createDM();
    await dm.send('📝 Vamos iniciar sua whitelist. Responda as perguntas a seguir uma por uma.');

    for (const question of questions) {
      await dm.send(question);
      const collected = await dm.awaitMessages({ max: 1, time: 60000 });
      if (!collected.size) {
        await dm.send('❌ Tempo esgotado. Tente novamente com /whitelist');
        return;
      }
      respostas.push(collected.first().content);
    }

    const embed = new EmbedBuilder()
      .setTitle('📩 Nova Whitelist Recebida')
      .addFields(questions.map((q, i) => ({ name: q, value: respostas[i] || 'N/A' })))
      .setFooter({ text: `Usuário: ${user.tag} | ID: ${user.id}` });

    const canalStaff = await client.channels.fetch(config.canalWhitelistRespostas);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`aprovar_${user.id}`).setLabel('✅ Aprovar').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`recusar_${user.id}`).setLabel('❌ Recusar').setStyle(ButtonStyle.Danger)
    );

    await canalStaff.send({ embeds: [embed], components: [row] });
    await dm.send('✅ Suas respostas foram enviadas. Aguarde a análise da equipe.');
  }

  if (commandName === 'pve') {
    const user = interaction.user;
    let dm = await user.createDM();
    await dm.send('📝 Envie aqui seu Steam ID para cadastro no PVE.');
    const collected = await dm.awaitMessages({ max: 1, time: 60000 });
    if (!collected.size) {
      await dm.send('❌ Tempo esgotado. Tente novamente com /pve');
      return;
    }

    const member = await interaction.guild.members.fetch(user.id);
    await member.roles.add(config.cargoPVE);
    await dm.send('✅ Cadastro concluído. Você agora tem acesso ao servidor PVE!');
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const [action, userId] = interaction.customId.split('_');
  const member = await interaction.guild.members.fetch(userId);

  if (action === 'aprovar') {
    await member.roles.add(config.cargoRP);
    await member.send('✅ Você foi aprovado na whitelist RP. Bem-vindo!');
    await interaction.reply({ content: 'Usuário aprovado e cargo atribuído.', ephemeral: true });
  } else if (action === 'recusar') {
    await member.send('❌ Infelizmente sua whitelist foi recusada. Você pode tentar novamente.');
    await interaction.reply({ content: 'Usuário recusado.', ephemeral: true });
  }
});

ticketHandler(client);
client.login(config.token);
