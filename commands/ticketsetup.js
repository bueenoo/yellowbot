const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType } = require('discord.js');
const { staffRoleId } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription('Publica o painel de abertura de tickets (Apenas Staff)')
    .addChannelOption(opt =>
      opt.setName('canal')
        .setDescription('Canal onde publicar (opcional, usa o atual se vazio)')
        .addChannelTypes(ChannelType.GuildText)
    ),
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(staffRoleId)) {
      return interaction.reply({ content: '🚫 Apenas @Staff pode usar este comando.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('canal') || interaction.channel;

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle('📢 Abertura de Tickets')
      .setDescription('Selecione uma das opções abaixo para abrir um ticket:');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_open_doacoes').setLabel('💰 Doações').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('ticket_open_denuncia').setLabel('🚨 Denúncia').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('ticket_open_suporte').setLabel('🛠️ Suporte Técnico').setStyle(ButtonStyle.Primary),
    );

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Painel de tickets publicado.', ephemeral: true });
  },
};
