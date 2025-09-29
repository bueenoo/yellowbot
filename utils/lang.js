import {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder
} from 'discord.js';

export async function sendLanguageMessage(channel) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('lang_pt').setLabel('BR Português').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('lang_es').setLabel('ES Español').setStyle(ButtonStyle.Secondary),
  );
  await channel.send({
    embeds: [new EmbedBuilder()
      .setTitle('Escolha seu idioma / Elige tu idioma')
      .setDescription('Selecione abaixo para continuar / Selecciona abajo para continuar:')
      .setColor(0x2b2d31)],
    components: [row]
  });
}
