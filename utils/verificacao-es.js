const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

function buildES() {
  const embed = new EmbedBuilder()
    .setColor('#9333ea')
    .setTitle('Black • Verificación de Acceso (ES)')
    .setDescription([
      'Elige abajo para continuar:',
      '• **Black RP**: iniciar whitelist basada en la lore.',
      '• **Black PVE**: registrar tu Steam ID y liberar acceso al PVE.'
    ].join('\n'));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ver_es_rp').setLabel('🕵️ Black RP').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('ver_es_pve').setLabel('⚔️ Black PVE').setStyle(ButtonStyle.Secondary),
  );

  return { embed, row };
}

module.exports = { buildES };