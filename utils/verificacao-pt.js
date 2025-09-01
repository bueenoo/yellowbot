const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

function buildPT() {
  const embed = new EmbedBuilder()
    .setColor('#0ea5e9')
    .setTitle('Black • Verificação de Acesso (PT)')
    .setDescription([
      'Escolha abaixo para continuar:',
      '• **Black RP**: iniciar whitelist baseada na lore.',
      '• **Black PVE**: cadastrar sua Steam ID e liberar acesso ao PVE.'
    ].join('\n'));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ver_pt_rp').setLabel('🕵️ Black RP').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('ver_pt_pve').setLabel('⚔️ Black PVE').setStyle(ButtonStyle.Secondary),
  );

  return { embed, row };
}

module.exports = { buildPT };