const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { canalMensagemVerificacao } = require('./config.json');

async function enviarMensagemDeVerificacao(client, channelId = null) {
  const alvo = channelId ?? canalMensagemVerificacao;
  const canal = await client.channels.fetch(alvo);
  if (!canal) throw new Error('Canal de verificação não encontrado.');

  const embed = new EmbedBuilder()
    .setColor(0x000000)
    .setTitle('Black • Verificação de Acesso')
    .setDescription([
      'Escolha abaixo para continuar:',
      '• **Black RP**: iniciar whitelist por DM, baseada na lore do servidor.',
      '• **Black PVE**: cadastrar sua Steam ID e liberar acesso ao PVE.'
    ].join('\n'));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('verificar_rp')
      .setLabel('🎭 Black RP')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('verificar_pve')
      .setLabel('⚔️ Black PVE')
      .setStyle(ButtonStyle.Secondary)
  );

  await canal.send({ embeds: [embed], components: [row] });
  console.log('✅ Mensagem de verificação publicada.');
}

module.exports = { enviarMensagemDeVerificacao };
