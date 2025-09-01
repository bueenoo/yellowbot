// utils/tickets.js
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');

/**
 * Envia a mensagem de abertura de tickets no canal e a fixa.
 * Remove mensagens antigas do próprio bot para evitar duplicação.
 * @param {import('discord.js').TextChannel} channel
 */
async function enviarMensagemDeTickets(channel) {
  if (!channel) throw new Error('Canal inválido para enviar os tickets.');

  // Verifica permissões mínimas
  const me = channel.guild.members.me;
  const need = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.ManageMessages, // para limpar e fixar
  ];
  const missing = need.filter(p => !channel.permissionsFor(me).has(p));
  if (missing.length) {
    throw new Error(
      `Permissões faltando no canal ${channel.id}: ${missing.join(', ')}`
    );
  }

  // Limpa mensagens anteriores do próprio bot
  try {
    const msgs = await channel.messages.fetch({ limit: 50 });
    const minhas = msgs.filter(m => m.author.id === me.id);
    for (const [, msg] of minhas) {
      try { await msg.delete(); } catch {}
    }
  } catch {}

  // Embed PT/ES
  const embed = new EmbedBuilder()
    .setColor('#000000')
    .setTitle('🎟️ Abertura de Tickets • Apertura de Tickets')
    .setDescription(
      [
        '**Selecione uma das opções abaixo / Selecciona una opción:**',
        '',
        '• 💰 **Doações / Donaciones**',
        '• 🚨 **Denúncia / Denuncia**',
        '• ⚙️ **Suporte Técnico / Soporte Técnico**',
      ].join('\n')
    )
    .setFooter({ text: 'Black • Sistema de Tickets (PT/ES)' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_doacoes')
      .setEmoji('💰')
      .setLabel('Doações / Donaciones')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('ticket_denuncia')
      .setEmoji('🚨')
      .setLabel('Denúncia / Denuncia')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('ticket_suporte')
      .setEmoji('⚙️')
      .setLabel('Suporte Técnico / Soporte Técnico')
      .setStyle(ButtonStyle.Primary)
  );

  const msg = await channel.send({ embeds: [embed], components: [row] });

  try { await msg.pin(); } catch {}
}

module.exports = { enviarMensagemDeTickets };