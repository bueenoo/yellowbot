// utils/verificacao.js
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');

/**
 * ======== CONFIG AQUI ========
 * Ajuste os IDs conforme a sua necessidade
 */
const IDS = {
  // Cargos de idioma
  rolePT: '1411977536388468799', // @PT
  roleES: '1411977277914353767', // @ES

  // Canais “início” por idioma
  canalInfoPT: '1401950359106355321', // canal em português
  canalInfoES: '1411982536405418154', // canal em espanhol

  // Fluxo RP (WL) PT
  canalWlPT: '1401950755031748628',      // onde está a whitelist PT
  canalEsperandoAprovacao: '1402205533272014858', // esperando aprovação
  canalStaffLogWL: '1401951752055427152', // log interno para staff (WL)
  canalWlReprovadoPT: '1402206198668853299', // WL reprovados PT
  canalWlFallidoES: '1412024192466944090',   // WL fallido ES

  // Fluxo PVE PT
  canalCadastroPVE: '1401951160629461002' // cadastro PVE (Steam ID)
};

/**
 * Envia a mensagem de escolha de idioma e fixa.
 * É chamada no clientReady pelo index.js
 */
async function enviarMensagemDeVerificacao(client, canalVerificacaoId) {
  const canal = await client.channels.fetch(canalVerificacaoId);

  const embed = new EmbedBuilder()
    .setColor('#000000')
    .setTitle('🗣️ Selecione seu idioma • Selecciona tu idioma')
    .setDescription(
      'Escolha abaixo para continuar a verificação **em PT**.\n' +
      'Elige abajo para continuar la verificación **en ES**.'
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('lang_pt')
      .setEmoji('🇧🇷')
      .setLabel('Português')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('lang_es')
      .setEmoji('🇪🇸')
      .setLabel('Español')
      .setStyle(ButtonStyle.Secondary)
  );

  // (Opcional) Limpar mensagens antigas do bot para não acumular
  try {
    const msgs = await canal.messages.fetch({ limit: 25 });
    const minhas = msgs.filter(m => m.author?.id === client.user.id);
    if (minhas.size > 0 && canal.permissionsFor(client.user)?.has(PermissionFlagsBits.ManageMessages)) {
      await canal.bulkDelete(minhas, true).catch(() => {});
    }
  } catch (_) {}

  const msg = await canal.send({ embeds: [embed], components: [row] }).catch((e)=> {
    throw e;
  });

  // Fixar
  try {
    await msg.pin().catch(() => {});
  } catch (_) {}
}

/**
 * Handler das interações (botões) da verificação
 * Deve ser chamado pelo roteador do index.js
 *
 * Retorna true se a interação foi tratada aqui.
 */
async function onInteraction(interaction, client) {
  if (!interaction.isButton()) return false;

  const member = interaction.member;

  // ================== Escolha de idioma ==================
  if (interaction.customId === 'lang_pt' || interaction.customId === 'lang_es') {
    const isPT = interaction.customId === 'lang_pt';
    const roleId = isPT ? IDS.rolePT : IDS.roleES;

    // Tenta aplicar o cargo de idioma
    try {
      if (member && roleId) {
        await member.roles.add(roleId).catch(() => {});
      }
    } catch (_) {}

    // Mostra menu RP/PVE no idioma escolhido (só para o usuário - ephemeral)
    const embed = new EmbedBuilder()
      .setColor('#000000')
      .setTitle(isPT ? 'Black • Verificação de Acesso (PT)' : 'Black • Verificación de Acceso (ES)')
      .setDescription(
        isPT
          ? 'Escolha abaixo para continuar:\n' +
            '• **Black RP**: iniciar whitelist baseada na lore.\n' +
            '• **Black PVE**: cadastrar sua Steam ID e liberar acesso ao PVE.'
          : 'Elige abajo para continuar:\n' +
            '• **Black RP**: iniciar whitelist basada en la lore.\n' +
            '• **Black PVE**: registrar tu Steam ID y liberar acceso al PVE.'
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(isPT ? 'pt_rp' : 'es_rp')
        .setEmoji('📜')
        .setLabel(isPT ? 'Black RP' : 'Black RP')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(isPT ? 'pt_pve' : 'es_pve')
        .setEmoji('⚔️')
        .setLabel(isPT ? 'Black PVE' : 'Black PVE')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true }).catch(() => {});
    return true;
  }

  // ================== Fluxo PT RP ==================
  if (interaction.customId === 'pt_rp') {
    await interaction.reply({
      content:
        `📄 Vá até o canal <#${IDS.canalWlPT}> e siga as instruções para preencher sua whitelist.\n` +
        `Após enviar, aguarde em <#${IDS.canalEsperandoAprovacao}>.`,
      ephemeral: true
    }).catch(() => {});
    return true;
  }

  // ================== Fluxo ES RP (mesmo fluxo, texto ES) ==================
  if (interaction.customId === 'es_rp') {
    await interaction.reply({
      content:
        `📄 Ve al canal <#${IDS.canalWlPT}> y sigue las instrucciones para completar tu whitelist.\n` + // si tienes un canal ES diferente, reemplaza aquí
        `Después de enviar, espera en <#${IDS.canalEsperandoAprovacao}>.`,
      ephemeral: true
    }).catch(() => {});
    return true;
  }

  // ================== Fluxo PT PVE ==================
  if (interaction.customId === 'pt_pve') {
    await interaction.reply({
      content:
        `⚔️ Para PVE em PT: envie sua **Steam ID** no canal <#${IDS.canalCadastroPVE}>.\n` +
        `Assim que validado, o acesso será liberado.`,
      ephemeral: true
    }).catch(() => {});
    return true;
  }

  // ================== Fluxo ES PVE ==================
  if (interaction.customId === 'es_pve') {
    await interaction.reply({
      content:
        `⚔️ Para PVE en ES: envía tu **Steam ID** en el canal <#${IDS.canalCadastroPVE}>.\n` +
        `Una vez validado, el acceso será liberado.`,
      ephemeral: true
    }).catch(() => {});
    return true;
  }

  return false; // não tratado aqui
}

module.exports = {
  enviarMensagemDeVerificacao,
  onInteraction
};
