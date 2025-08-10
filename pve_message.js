const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { canalPVEForm } = require('./config.json');

async function publicarCadastroPVE(client, channelId = null) {
  const alvo = channelId ?? canalPVEForm;
  const canal = await client.channels.fetch(alvo);
  if (!canal) throw new Error('Canal PVE não encontrado.');

  const embed = new EmbedBuilder()
    .setColor(0x000000)
    .setTitle('Cadastro PVE • Steam ID')
    .setDescription('Clique no botão abaixo para enviar sua **Steam ID**. O botão é de **uso único por usuário**.');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('pve_enviar_steam')
      .setLabel('Enviar Steam ID')
      .setStyle(ButtonStyle.Success)
  );

  await canal.send({ embeds: [embed], components: [row] });
  console.log('✅ Mensagem de cadastro PVE publicada.');
}

module.exports = { publicarCadastroPVE };
