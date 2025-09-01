
const { PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

async function setupTickets(client, canalAbrirTicket) {
  const canal = await client.channels.fetch(canalAbrirTicket);
  if (!canal) throw new Error("Canal de abrir-ticket não encontrado.");

  const embed = {
    color: 0x2f3136,
    title: "📢 Abertura de Tickets • Apertura de Tickets",
    description: "Selecione uma das opções abaixo para abrir um ticket:\n\n🇧🇷 **Português**\n• 💰 Doações\n• 🚨 Denúncia\n• ⚙️ Suporte Técnico\n\n🇪🇸 **Español**\n• 💰 Donaciones\n• 🚨 Denuncia\n• ⚙️ Soporte Técnico",
  };

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_doacoes').setLabel('💰 Doações / Donaciones').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('ticket_denuncia').setLabel('🚨 Denúncia / Denuncia').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('ticket_suporte').setLabel('⚙️ Suporte Técnico / Soporte Técnico').setStyle(ButtonStyle.Primary),
  );

  const messages = await canal.messages.fetch({ limit: 10 });
  const botMessage = messages.find(m => m.author.id === client.user.id && m.embeds.length && m.embeds[0].title?.includes("Abertura de Tickets"));
  if (botMessage) {
    await botMessage.edit({ embeds: [embed], components: [row] });
  } else {
    await canal.send({ embeds: [embed], components: [row] });
  }
}

async function handleTicketInteraction(interaction, client, config) {
  if (!interaction.isButton()) return false;
  const { canalLogTickets, categoriaTickets, staffRoles } = config;

  let tipo = null;
  if (interaction.customId === 'ticket_doacoes') tipo = '💰│doacoes-donaciones';
  if (interaction.customId === 'ticket_denuncia') tipo = '🚨│denuncia-denuncia';
  if (interaction.customId === 'ticket_suporte') tipo = '⚙️│suporte-soporte';
  if (!tipo) return false;

  await interaction.deferReply({ ephemeral: true });

  const canal = await interaction.guild.channels.create({
    name: `${tipo}-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: categoriaTickets,
    permissionOverwrites: [
      { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ...staffRoles.map(r => ({ id: r, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }))
    ],
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_fechar').setLabel('🔒 Fechar Ticket / Cerrar Ticket').setStyle(ButtonStyle.Secondary),
  );

  await canal.send({
    content: `🎫 Ticket aberto por <@${interaction.user.id}>.\nStaff, por favor, atenda este ticket.`,
    components: [row],
  });

  await interaction.editReply({ content: `✅ Ticket criado: ${canal}` });
  return true;
}

async function fecharTicket(interaction, client, config) {
  if (interaction.customId !== 'ticket_fechar') return false;
  await interaction.deferReply({ ephemeral: true });

  const canal = interaction.channel;
  const messages = await canal.messages.fetch({ limit: 100 });
  const log = messages.map(m => `${m.author.tag}: ${m.content}`).reverse().join("\n");

  const filePath = path.join(__dirname, `transcript-${canal.id}.txt`);
  fs.writeFileSync(filePath, log, "utf8");

  const canalLog = await client.channels.fetch(config.canalLogTickets);
  if (canalLog) {
    await canalLog.send({
      content: `📄 Transcript do ticket ${canal.name}`,
      files: [filePath],
    });
  }

  try { await interaction.user.send({ content: "📄 Transcript do seu ticket:", files: [filePath] }); } catch {}
  await interaction.editReply({ content: "✅ Ticket fechado." });

  setTimeout(() => canal.delete().catch(() => {}), 1500);
  return true;
}

module.exports = { setupTickets, handleTicketInteraction, fecharTicket };
