
const { Events, ChannelType, PermissionsBitField } = require('discord.js');

function ticketHandler(client) {
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    const ticketTypes = {
      'ticket_doacao': { nome: '💰-doacao', mensagem: 'Nos envie detalhes sobre sua doação.' },
      'ticket_denuncia': { nome: '🚨-denuncia', mensagem: 'Descreva sua denúncia com clareza.' },
      'ticket_suporte': { nome: '⚙️-suporte', mensagem: 'Explique seu problema técnico.' }
    };

    const tipo = ticketTypes[interaction.customId];
    if (!tipo) return;

    const existing = interaction.guild.channels.cache.find(c => c.name.includes(tipo.nome) && c.topic === interaction.user.id);
    if (existing) {
      return interaction.reply({ content: '❗ Você já tem um ticket aberto.', ephemeral: true });
    }

    const channel = await interaction.guild.channels.create({
      name: `${tipo.nome}-${interaction.user.username}`,
      type: ChannelType.GuildText,
      topic: interaction.user.id,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        }
      ]
    });

    await channel.send(`<@${interaction.user.id}> ${tipo.mensagem}`);
    await interaction.reply({ content: `🎫 Ticket criado: ${channel}`, ephemeral: true });
  });
}

module.exports = { ticketHandler };
