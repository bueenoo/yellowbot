// utils/verificacao.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

async function enviarMensagemDeVerificacao(canal) {
  const embed = new EmbedBuilder()
    .setColor('#000000')
    .setTitle('🌐 Selecione seu idioma • Selecciona tu idioma')
    .setDescription(
      [
        'Escolha abaixo para continuar a verificação no seu idioma.',
        'Elige abajo para continuar la verificación en tu idioma.',
      ].join('\n')
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('lang_pt')
      .setLabel('🇧🇷 Português')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('lang_es')
      .setLabel('🇪🇸 Español')
      .setStyle(ButtonStyle.Secondary)
  );

  const msg = await canal.send({ embeds: [embed], components: [row] });
  // tenta fixar; se não tiver permissão, só ignora
  try { await msg.pin(); } catch (_) {}
}

module.exports = { enviarMensagemDeVerificacao };
