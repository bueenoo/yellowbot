
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
        ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

async function cleanAndPin(channel, payload) {
  const msgs = await channel.messages.fetch({limit:50}).catch(()=>null);
  if (msgs) {
    for (const m of msgs.filter(m=>m.author?.bot).values()) {
      try { await m.unpin().catch(()=>{}); await m.delete().catch(()=>{}); } catch {}
    }
  }
  const sent = await channel.send(payload);
  await sent.pin().catch(()=>{});
  return sent;
}

async function enviarMensagemDeVerificacao(channel, { rolePT, roleES }) {
  const embed = new EmbedBuilder()
    .setColor(0x000000)
    .setTitle('🗣️ Selecione seu idioma • Selecciona tu idioma')
    .setDescription('Escolha abaixo para continuar (PT). / Elige abajo para continuar (ES).');
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('lang_pt').setEmoji('🇧🇷').setLabel('Português').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('lang_es').setEmoji('🇪🇸').setLabel('Español').setStyle(ButtonStyle.Secondary)
  );
  await cleanAndPin(channel, { embeds:[embed], components:[row] });
}

function rpPve(locale) {
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle(locale==='pt' ? 'Black • Verificação de Acesso' : 'Black • Verificación de Acceso')
    .setDescription(locale==='pt'
      ? '• **Black RP**: iniciar whitelist (DM)\n• **Black PVE**: cadastrar sua Steam ID'
      : '• **Black RP**: iniciar whitelist (DM)\n• **Black PVE**: registrar tu Steam ID');
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`${locale}_rp`).setEmoji('🕵️').setLabel('Black RP').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`${locale}_pve`).setEmoji('⚔️').setLabel('Black PVE').setStyle(ButtonStyle.Secondary)
  );
  return {embed,row};
}

async function askDM(dm, userId, text, timeMs=300000) {
  await dm.send({content:text});
  const c = await dm.awaitMessages({filter:m=>m.author.id===userId, max:1, time:timeMs});
  if(!c.size) throw new Error('timeout');
  return c.first().content.trim();
}

async function wlFlow(interaction, locale, cfg) {
  const user = interaction.user;
  const t = (pt,es)=> locale==='pt'?pt:es;
  await interaction.reply({ content: t('📬 Iniciamos sua WL no **DM**.','📬 Iniciamos tu WL por **DM**.'), flags:64 }).catch(()=>{});
  const dm = await user.createDM();

  try{
    const nome = await askDM(dm, user.id, t('✍️ Seu **nome completo**?', '✍️ Tu **nombre completo**?'));
    const idade = await askDM(dm, user.id, t('📅 Sua **idade**?', '📅 Tu **edad**?'));
    const steam = await askDM(dm, user.id, t('🎮 Sua **Steam ID**?', '🎮 Tu **Steam ID**?'));
    const expRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('rp_exp_sim').setLabel(locale==='pt'?'Sim':'Sí').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('rp_exp_nao').setLabel(locale==='pt'?'Não':'No').setStyle(ButtonStyle.Danger),
    );
    await dm.send({content:t('🎭 Tem **experiência com RP**?','🎭 ¿Tienes **experiencia con RP**?'), components:[expRow]});
    const expI = await dm.awaitMessageComponent({filter:i=>i.user.id===user.id, time:300000});
    const experiencia = expI.customId==='rp_exp_sim' ? (locale==='pt'?'Sim':'Sí') : (locale==='pt'?'Não':'No');
    await expI.update({content:t(`Experiência: ${experiencia}`, `Experiencia: ${experiencia}`), components:[]});

    let historia='';
    while(true){
      historia = await askDM(dm, user.id, t('🧾 Envie a **história do personagem** (máx 600).','🧾 Envía la **historia** (máx 600).'));
      if (historia.length<=600) break;
      await dm.send(t('⚠️ Máximo 600 caracteres.','⚠️ Máximo 600 caracteres.'));
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(locale==='pt'?'📥 Nova WL (PT)':'📥 Nueva WL (ES)')
      .addFields(
        {name:'Usuário/Usuario', value:`<@${user.id}> (${user.tag})`, inline:false},
        {name:'Discord ID', value:user.id, inline:true},
        {name:'Nome/Nombre', value:nome, inline:true},
        {name:'Idade/Edad', value:idade, inline:true},
        {name:'Steam ID', value:steam, inline:false},
        {name:'Experiência/Experiencia', value:experiencia, inline:true},
        {name:'História/Historia', value:historia||'—', inline:false},
        {name:'Idioma', value:locale.toUpperCase(), inline:true}
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`wl_aprovar_${user.id}_${locale}`).setLabel('✅ Aprovar/Aprobar').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`wl_reprovar_${user.id}_${locale}`).setLabel('❌ Reprovar/Rechazar').setStyle(ButtonStyle.Danger)
    );

    const staff = await interaction.client.channels.fetch("1401951752055427152").catch(()=>null);
    if (staff) await staff.send({embeds:[embed], components:[row]});

    const wait = await interaction.client.channels.fetch(cfg.canalEsperaAprovacao).catch(()=>null);
    if (wait) await wait.send({content:t(`⏳ <@${user.id}>, WL enviada. Aguarde.`,`⏳ <@${user.id}>, WL enviada. Espera.`)});
    await dm.send(t('✅ WL enviada. Obrigado!','✅ WL enviada. ¡Gracias!'));
  }catch(e){
    try{ await dm.send('❌ Erro no fluxo da WL.'); }catch{}
    console.error('WL error', e.message);
  }
}

async function pveModal(interaction, locale, cfg) {
  const modal = new ModalBuilder().setCustomId(`pve_modal_${interaction.user.id}`).setTitle(locale==='pt'?'Cadastro PVE • Steam ID':'Registro PVE • Steam ID');
  const input = new TextInputBuilder().setCustomId('steamid').setLabel(locale==='pt'?'Sua Steam ID':'Tu Steam ID').setStyle(TextInputStyle.Short).setRequired(true);
  const row = new ActionRowBuilder().addComponents(input);
  modal.addComponents(row);
  await interaction.showModal(modal);
}

async function handleVerificationInteractions(interaction, cfg) {
  if (interaction.isButton()) {
    // Idioma + role
    if (interaction.customId === 'lang_pt' || interaction.customId === 'lang_es') {
      const isPT = interaction.customId==='lang_pt';
      const roleId = isPT ? cfg.rolePT : cfg.roleES;
      try { await interaction.member.roles.add(roleId).catch(()=>{});}catch{}

      const {embed,row} = rpPve(isPT?'pt':'es');
      return interaction.reply({embeds:[embed], components:[row], flags:64});
    }
    // RP / PVE
    if (interaction.customId==='pt_rp') return wlFlow(interaction, 'pt', cfg);
    if (interaction.customId==='es_rp') return wlFlow(interaction, 'es', cfg);
    if (interaction.customId==='pt_pve') return pveModal(interaction, 'pt', cfg);
    if (interaction.customId==='es_pve') return pveModal(interaction, 'es', cfg);

    // Aprovar / Reprovar WL
    if (interaction.customId.startsWith('wl_aprovar_')) {
      const [_,userId,locale] = interaction.customId.split('_').slice(1);
      const member = await interaction.guild.members.fetch(userId).catch(()=>null);
      if (member) {
        await member.roles.add(cfg.cargoRP).catch(()=>{});
        await member.send(locale==='pt'?'✅ Sua WL foi aprovada!':'✅ ¡Tu WL fue aprobada!').catch(()=>{});
      }
      return interaction.reply({content:'✅ Aprovado.', flags:64});
    }
    if (interaction.customId.startsWith('wl_reprovar_')) {
      const [_,userId,locale] = interaction.customId.split('_').slice(1);
      // pede motivo com modal simples
      const modal = new ModalBuilder().setCustomId(`wl_motivo_${userId}_${locale}`).setTitle('Motivo • Reason');
      const input = new TextInputBuilder().setCustomId('motivo').setLabel('Motivo').setStyle(TextInputStyle.Paragraph).setRequired(true);
      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);
      return interaction.showModal(modal);
    }
  }

  // Modal submits
  if (interaction.isModalSubmit()) {
    // PVE modal
    if (interaction.customId.startsWith('pve_modal_')) {
      const steam = interaction.fields.getTextInputValue('steamid');
      const ch = await interaction.client.channels.fetch(cfg.canalCadastroPVE).catch(()=>null);
      if (ch) await ch.send({content:`📥 **Steam ID** recebido de <@${interaction.user.id}>: \`${steam}\``});
      try { await interaction.member.roles.add(cfg.cargoPVE).catch(()=>{});}catch{}
      return interaction.reply({content:'✅ Steam ID recebida. Acesso PVE liberado.', flags:64});
    }
    // WL motivo modal
    if (interaction.customId.startsWith('wl_motivo_')) {
      const [_, userId, locale] = interaction.customId.split('_').slice(1);
      const motivo = interaction.fields.getTextInputValue('motivo');
      const chId = locale==='pt'? cfg.canalWLReprovadosPT : cfg.canalWLReprovadosES;
      const ch = await interaction.client.channels.fetch(chId).catch(()=>null);
      if (ch) await ch.send({content:`❌ <@${userId}> reprovado.\n**Discord ID:** ${userId}\n**Motivo:** ${motivo}`});
      const member = await interaction.guild.members.fetch(userId).catch(()=>null);
      if (member) await member.send(locale==='pt'?`❌ Sua WL foi reprovada.\nMotivo: ${motivo}`:`❌ Tu WL fue rechazada.\nMotivo: ${motivo}`).catch(()=>{});
      return interaction.reply({content:'✅ Motivo enviado.', flags:64});
    }
  }
}

module.exports = { enviarMensagemDeVerificacao, handleVerificationInteractions };
