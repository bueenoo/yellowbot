
const { PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');

async function abrirTicket(interaction, tipo, cfg) {
  await interaction.deferReply({ flags: 64 }).catch(()=>{});

  // Impede 1 ticket por tipo por usuário
  const guild = interaction.guild;
  const existing = guild.channels.cache.find(c => 
    c.parentId === cfg.categoriaTickets &&
    c.type === ChannelType.GuildText &&
    c.topic === `ticket:${tipo}:${interaction.user.id}`
  );
  if (existing) {
    return interaction.editReply({ content: `❗ Você já possui um ticket aberto: <#${existing.id}>`, flags:64 });
  }

  const name = `🎫-${tipo}-${interaction.user.username}`.toLowerCase().slice(0,90);
  const channel = await guild.channels.create({
    name,
    type: ChannelType.GuildText,
    parent: cfg.categoriaTickets,
    topic: `ticket:${tipo}:${interaction.user.id}`,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      { id: cfg.adminRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      ...cfg.staffRoles.map(rid => ({ id: rid, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }))
    ]
  });

  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('🎫 Ticket aberto')
    .setDescription(`Tipo: **${tipo}**\nAutor: <@${interaction.user.id}>`);

  await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed] });
  const log = await interaction.client.channels.fetch(cfg.canalLogTickets).catch(()=>null);
  if (log) await log.send({ content: `📝 Ticket **${tipo}** aberto em <#${channel.id}> por <@${interaction.user.id}>` });

  return interaction.editReply({ content: `✅ Ticket criado: <#${channel.id}>`, flags:64 });
}

module.exports = { abrirTicket };
