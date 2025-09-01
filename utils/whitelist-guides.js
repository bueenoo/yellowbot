const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function buildPT() {
  const embed = new EmbedBuilder()
    .setColor('#000000')
    .setTitle('📋 Whitelist (PT) • Instruções')
    .setDescription(
      'Responda a whitelist com base na lore do servidor.\n\n' +
      '🧾 **Perguntas exigidas**\n' +
      '• Nome\n' +
      '• Idade\n' +
      '• ID do Discord\n' +
      '• Steam ID\n' +
      '• Experiência com RP (Sim/Não)\n' +
      '• História do personagem (até **600** caracteres)\n\n' +
      '👉 Clique no botão abaixo para iniciar por DM.'
    );
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ver_pt_rp').setLabel('Iniciar WL por DM (PT)').setStyle(ButtonStyle.Primary)
  );
  return { embed, row };
}

function buildES() {
  const embed = new EmbedBuilder()
    .setColor('#000000')
    .setTitle('📋 Whitelist (ES) • Instrucciones')
    .setDescription(
      'Responde a la whitelist basada en la lore del servidor.\n\n' +
      '🧾 **Preguntas requeridas**\n' +
      '• Nombre\n' +
      '• Edad\n' +
      '• ID de Discord\n' +
      '• Steam ID\n' +
      '• Experiencia con RP (Sí/No)\n' +
      '• Historia del personaje (hasta **600** caracteres)\n\n' +
      '👉 Haz clic en el botón para iniciar por DM.'
    );
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ver_es_rp').setLabel('Iniciar WL por DM (ES)').setStyle(ButtonStyle.Primary)
  );
  return { embed, row };
}

module.exports = { buildPT, buildES };
