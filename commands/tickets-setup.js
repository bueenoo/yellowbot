// commands/tickets-setup.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { canalAbrirTicket } = require('../config.json');
const { enviarMensagemDeTickets } = require('../utils/tickets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tickets-setup')
    .setDescription('Reposta e fixa a mensagem de abertura de tickets no canal configurado.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const channel = await interaction.client.channels.fetch(canalAbrirTicket);
      await enviarMensagemDeTickets(channel);
      await interaction.reply({ content: '✅ Mensagem de tickets enviada e fixada.', ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `❗ Falha: ${err.message}`, ephemeral: true });
    }
  },
};