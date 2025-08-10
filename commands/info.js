const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { allowedInfoChannel } = require('../config.json');

const PVE_HOST = '189.127.165.165';
const PVE_PORT = '2382';
const RP_STATUS = 'Offline — em construção';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Mostra IPs dos servidores e status.'),
  async execute(interaction) {
    if (interaction.channelId !== allowedInfoChannel) {
      return interaction.reply({
        content: `Use este comando no canal <#${allowedInfoChannel}>.`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle('Black • Status dos Servidores')
      .addFields(
        { name: 'RP', value: RP_STATUS, inline: false },
        { name: 'PVE', value: `**IP:** ${PVE_HOST}\n**Porta:** ${PVE_PORT}`, inline: false },
      )
      .setTimestamp(new Date());

    await interaction.reply({ embeds: [embed] });
  },
};
