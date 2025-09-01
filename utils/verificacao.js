
// utils/verificacao.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ensureSendable } = require('./check-perms');

async function enviarMensagemDeVerificacao(channel) {
  // 🔒 Verifica permissões antes de tentar enviar
  const check = await ensureSendable(channel);
  if (!check.ok) {
    console.error('❌ Falta de permissões no canal de verificação:', {
      canalId: channel.id,
      missing: check.missing || check.error?.message,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor('#111827')
    .setTitle('🌍 Selecione seu idioma • Selecciona tu idioma')
    .setDescription(
      'Escolha abaixo para continuar a verificação no seu idioma.\n' +
      'Elige abajo para continuar la verificación en tu idioma.'
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('lang_pt').setLabel('🇧🇷 Português').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('lang_es').setLabel('🇪🇸 Español').setStyle(ButtonStyle.Secondary),
  );

  try {
    const msg = await channel.send({ embeds: [embed], components: [row] });

    // 📌 Tenta fixar
    try {
      await msg.pin();
    } catch (e) {
      console.warn('⚠️ Não consegui fixar a mensagem (Manage Messages ausente?):', e.message);
    }

    console.log('📌 Mensagem de idioma enviada e fixada.');
  } catch (err) {
    console.error('Erro ao enviar mensagem de verificação:', err);
  }
}

module.exports = { enviarMensagemDeVerificacao };
