const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags
} = require('discord.js');

// locale: 'pt' | 'es'
async function startWL(interaction, locale, ids) {
  const user = interaction.user;
  try {
    await interaction.reply({
      content: locale === 'pt'
        ? `📬 Iniciamos sua whitelist por **DM**. Verifique suas mensagens diretas. Após concluir, aguarde em <#${ids.canalEspera}>.`
        : `📬 Iniciamos tu whitelist por **DM**. Revisa tus mensajes directos. Tras terminar, espera en <#${ids.canalEspera}>.`,
      flags: MessageFlags.Ephemeral
    });
  } catch {}

  let dm;
  try {
    dm = await user.createDM();
  } catch {
    return;
  }

  const ask = async (text, max=300000) => {
    await dm.send(text);
    const collected = await dm.awaitMessages({ max: 1, time: max, filter: m => m.author.id === user.id });
    if (!collected.size) throw new Error('timeout');
    return collected.first().content.trim();
  };

  try {
    // Perguntas / Preguntas
    const nomeTxt = locale === 'pt' ? 'Qual é o seu **nome**?' : '¿Cuál es tu **nombre**?';
    const idadeTxt = locale === 'pt' ? 'Qual sua **idade**?' : '¿Cuál es tu **edad**?';
    const steamTxt = locale === 'pt' ? 'Qual sua **Steam ID**?' : '¿Cuál es tu **Steam ID**?';

    const nome = await ask(`📝 ${nomeTxt}`);
    const idade = await ask(`🎂 ${idadeTxt}`);
    const steam = await ask(`🎮 ${steamTxt}`);

    // Experiência com RP / Experiencia RP (botões)
    const expRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('wl_exp_yes').setLabel(locale==='pt'?'Tenho experiência':'Tengo experiencia').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('wl_exp_no').setLabel(locale==='pt'?'Sou iniciante':'Soy principiante').setStyle(ButtonStyle.Secondary)
    );
    await dm.send({ content: locale==='pt' ? '🎭 Você já jogou **RP** antes?' : '🎭 ¿Has jugado **RP** antes?', components: [expRow] });
    const expInt = await dm.awaitMessageComponent({ time: 300000, filter: i => i.user.id === user.id });
    const experiencia = expInt.customId === 'wl_exp_yes' ? (locale==='pt'?'Sim':'Sí') : (locale==='pt'?'Não':'No');
    await expInt.update({ content: `${locale==='pt'?'Experiência:':'Experiencia:'} ${experiencia}`, components: [] });

    // História 600 chars
    const histPrompt = locale==='pt'
      ? '📖 Envie a **história do seu personagem** (até **600** caracteres).'
      : '📖 Envía la **historia de tu personaje** (máximo **600** caracteres).';
    let historia;
    while (true) {
      historia = await ask(histPrompt);
      if (historia.length <= 600) break;
      await dm.send(locale==='pt'
        ? '⚠️ Sua história excedeu 600 caracteres. Tente novamente.'
        : '⚠️ Tu historia superó 600 caracteres. Intenta otra vez.');
    }

    // Monta embed para staff
    const embed = new EmbedBuilder()
      .setColor('#0ea5e9')
      .setTitle(locale==='pt' ? '📥 Nova WL (PT)' : '📥 Nueva WL (ES)')
      .addFields(
        { name: locale==='pt'?'Usuário':'Usuario', value: `<@${user.id}> (${user.tag})`, inline: false },
        { name: 'Discord ID', value: user.id, inline: false },
        { name: locale==='pt'?'Nome':'Nombre', value: nome || '-', inline: true },
        { name: locale==='pt'?'Idade':'Edad', value: idade || '-', inline: true },
        { name: 'Steam ID', value: steam || '-', inline: false },
        { name: locale==='pt'?'Experiência com RP':'Experiencia RP', value: experiencia, inline: true },
        { name: locale==='pt'?'História':'Historia', value: historia || '-', inline: false },
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`wl_aprovar_${user.id}`).setLabel('✅ Aprovar / Aprobar').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`wl_reprovar_${locale}_${user.id}`).setLabel('❌ Reprovar / Rechazar').setStyle(ButtonStyle.Danger)
    );

    const staffCh = await interaction.client.channels.fetch(ids.canalWhitelistRespostas);
    await staffCh.send({ embeds: [embed], components: [row] });

    await dm.send(locale==='pt'
      ? '✅ Sua WL foi enviada para análise. Agradecemos a paciência!'
      : '✅ Tu WL fue enviada para revisión. ¡Gracias por la paciencia!');

  } catch (e) {
    try {
      await dm.send(locale==='pt'
        ? '❌ Ocorreu um erro ou tempo esgotado. Você pode iniciar novamente pelo canal de verificação.'
        : '❌ Ocurrió un error o tiempo agotado. Puedes iniciar de nuevo desde el canal de verificación.');
    } catch {}
  }
}

async function handleStaffActions(interaction, ids, cargoRP) {
  // Aprovar
  if (interaction.customId.startsWith('wl_aprovar_')) {
    const userId = interaction.customId.split('wl_aprovar_')[1];
    const member = await interaction.guild.members.fetch(userId).catch(()=>null);
    if (member) {
      await member.roles.add(cargoRP).catch(()=>{});
      await member.send('✅ Sua/tu WL foi aprovada. Bom jogo!').catch(()=>{});
    }
    await interaction.reply({ content: '✅ Aprovado.', flags: MessageFlags.Ephemeral });
    return true;
  }

  // Reprovar → abre modal para motivo
  if (interaction.customId.startsWith('wl_reprovar_')) {
    const parts = interaction.customId.split('_'); // ['wl','reprovar','<locale>','<userId>']
    const locale = parts[2];
    const userId = parts[3];

    const modal = new ModalBuilder()
      .setCustomId(`wl_reason_${locale}_${userId}`)
      .setTitle(locale==='pt' ? 'Motivo da reprovação' : 'Motivo del rechazo');

    const motivo = new TextInputBuilder()
      .setCustomId('motivo')
      .setLabel(locale==='pt' ? 'Explique o motivo' : 'Explica el motivo')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(500)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(motivo));
    await interaction.showModal(modal);
    return true;
  }

  return false;
}

async function handleModal(interaction, ids) {
  if (!interaction.customId.startsWith('wl_reason_')) return false;
  const [, , locale, userId] = interaction.customId.split('_');

  const motivo = interaction.fields.getTextInputValue('motivo');
  const member = await interaction.guild.members.fetch(userId).catch(()=>null);

  const channelId = locale === 'pt' ? ids.canalWlReprovadoPT : ids.canalWlReprovadoES;
  const ch = await interaction.client.channels.fetch(channelId).catch(()=>null);

  if (ch) {
    const embed = new EmbedBuilder()
      .setColor('#ef4444')
      .setTitle(locale==='pt' ? '❌ WL Reprovada' : '❌ WL Rechazada')
      .addFields(
        { name: 'Discord', value: member ? `<@${member.id}> (${member.user.tag})` : userId, inline: false },
        { name: locale==='pt' ? 'Motivo' : 'Motivo', value: motivo }
      )
      .setTimestamp();
    await ch.send({ embeds: [embed] });
  }

  // tenta avisar o usuário no DM também
  if (member) {
    await member.send(locale==='pt'
      ? `❌ Sua WL foi reprovada.\nMotivo: ${motivo}`
      : `❌ Tu WL fue rechazada.\nMotivo: ${motivo}`
    ).catch(()=>{});
  }

  await interaction.reply({ content: '❗ Reprovado com motivo registrado.', flags: 1<<6 });
  return true;
}

module.exports = { startWL, handleStaffActions, handleModal };