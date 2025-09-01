
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
async function sendUniquePinned(channel, payload) {
  const fetched = await channel.messages.fetch({limit:50}).catch(()=>null);
  if (fetched) {
    for (const m of fetched.filter(m=>m.author?.bot).values()) {
      try { await m.unpin().catch(()=>{}); await m.delete().catch(()=>{});}catch{}
    }
  }
  const msg = await channel.send(payload);
  await msg.pin().catch(()=>{});
  return msg;
}
async function enviarMensagemDeTickets(channel) {
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('📨 Abertura de Tickets • Apertura de Tickets')
    .setDescription('Selecione uma opção (PT) • Selecciona una opción (ES)');
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_doacoes').setEmoji('💳').setLabel('Doações/Donaciones').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('ticket_denuncia').setEmoji('🚨').setLabel('Denúncia/Denuncia').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('ticket_suporte').setEmoji('🛠️').setLabel('Suporte/Soporte').setStyle(ButtonStyle.Primary),
  );
  await sendUniquePinned(channel, { embeds:[embed], components:[row] });
}
module.exports = { enviarMensagemDeTickets };
