require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionsBitField,
  REST,
  Routes,
  ChannelType,
  AttachmentBuilder,
} = require('discord.js');

const {
  canalWhitelistRespostas,
  canalPVEForm,
  canalReprovados,
  canalRegistroPVE,
  cargoRP,
  cargoPVE,
  staffRoleId,
  canalArquivosTickets,
} = require('./config.json');

const fs = require('fs');
const path = require('path');

if (!process.env.TOKEN) {
  console.log('ℹ️ TOKEN não encontrado no ambiente. O bot não será iniciado.');
  process.exit(0);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// Carrega comandos
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'));
const commandMap = new Map();
const commandData = [];
for (const file of commandFiles) {
  const mod = require(path.join(__dirname, 'commands', file));
  if (mod?.data?.name && typeof mod.execute === 'function') commandMap.set(mod.data.name, mod);
  if (mod?.data?.toJSON) commandData.push(mod.data.toJSON());
}

client.once('ready', async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    for (const g of client.guilds.cache.values()) {
      console.log(`⏳ Registrando ${commandData.length} comando(s) na guild ${g.id}...`);
      await rest.put(Routes.applicationGuildCommands(client.application.id, g.id), { body: commandData });
      console.log(`✅ Comandos registrados em ${g.id}`);
    }
  } catch (e) {
    console.error('❌ Falha ao registrar comandos após login:', e);
  }
});

// Utils
const pveRegistered = new Set();

async function ask(dm, userId, text, timeMs = 5 * 60 * 1000) {
  await dm.send(text);
  const collected = await dm.awaitMessages({ filter: (m) => m.author.id === userId, max: 1, time: timeMs });
  if (!collected.size) throw new Error('Tempo esgotado');
  return collected.first().content?.trim() || '';
}

async function coletarMensagensTexto(channel) {
  let lastId = null;
  const linhas = [];
  while (true) {
    const fetched = await channel.messages.fetch({ limit: 100, before: lastId ?? undefined });
    if (fetched.size === 0) break;
    const arr = Array.from(fetched.values());
    arr.reverse();
    for (const m of arr) {
      const ts = new Date(m.createdTimestamp).toISOString().replace('T', ' ').split('.')[0];
      let base = `[${ts}] ${m.author?.tag ?? m.author?.id ?? 'Desconhecido'}: ${m.content ?? ''}`.trim();
      if (m.attachments.size > 0) {
        const anexos = m.attachments.map(a => a.url).join(', ');
        base += ` \\n[Anexos] ${anexos}`;
      }
      linhas.push(base);
    }
    lastId = arr[0]?.id;
  }
  return linhas.join('\\n');
}

async function gerarEEnviarTranscript(interaction, motivo = 'fechado') {
  const ownerId = (interaction.channel.topic || '').replace('TICKET:', '');
  let ownerUser = null;
  try { if (ownerId) ownerUser = await interaction.client.users.fetch(ownerId); } catch {}
  const texto = await coletarMensagensTexto(interaction.channel);
  const header = [
    `Servidor: ${interaction.guild?.name ?? interaction.guildId}`,
    `Canal: #${interaction.channel?.name}`,
    `Ticket de: ${ownerId ? `<@${ownerId}>` : 'desconhecido'}`,
    `${motivo === 'apagado' ? 'Apagado' : 'Fechado'} por: <@${interaction.user.id}>`,
    `Data: ${new Date().toISOString().replace('T', ' ').split('.')[0]}`,
    ''.padEnd(40, '=')
  ].join('\\n');
  const corpo = `${header}\\n${texto}`;
  const nomeArquivo = `transcript-${interaction.channel?.name}-${Date.now()}.txt`;
  const anexo = new AttachmentBuilder(Buffer.from(corpo, 'utf8'), { name: nomeArquivo });

  if (ownerUser) {
    try {
      await ownerUser.send({
        content: motivo === 'apagado'
          ? '🗑️ Seu ticket foi apagado. Segue uma cópia do histórico:'
          : '🔒 Seu ticket foi fechado. Segue uma cópia do histórico:',
        files: [anexo]
      });
    } catch {}
  }

  if (canalArquivosTickets) {
    try {
      const staffCh = await interaction.client.channels.fetch(canalArquivosTickets);
      await staffCh.send({
        content: `📎 Transcript do ticket ${interaction.channel} ${motivo} por <@${interaction.user.id}>.`,
        files: [anexo]
      });
    } catch (e) {
      console.error('Falha ao enviar transcript para staff:', e);
    }
  }
}

client.on('interactionCreate', async (interaction) => {
  try {
    // Slash
    if (interaction.isChatInputCommand()) {
      const cmd = commandMap.get(interaction.commandName);
      if (cmd) return cmd.execute(interaction);
      return;
    }

    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    // ===== Tickets =====
    if (interaction.isButton() && interaction.customId.startsWith('ticket_open_')) {
      const tipo = interaction.customId.replace('ticket_open_', '');
      const parentId = interaction.channel.parentId;
      const existing = interaction.guild.channels.cache.find(c =>
        c.type === ChannelType.GuildText &&
        c.parentId === parentId &&
        c.topic === `TICKET:${interaction.user.id}`
      );
      if (existing) {
        return interaction.reply({ content: `📌 Você já tem um ticket aberto: <#${existing.id}>`, ephemeral: true });
      }

      const safeName = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'user';
      const channelName = `ticket-${tipo}-${safeName}`;

      const permissionOverwrites = [
        { id: interaction.guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.AttachFiles,
        ] },
      ];

      if (staffRoleId) {
        permissionOverwrites.push({
          id: staffRoleId,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.ManageMessages,
          ],
        });
      }

      permissionOverwrites.push({
        id: interaction.guild.members.me.roles.highest,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.AttachFiles,
          PermissionsBitField.Flags.ManageChannels,
        ],
      });

      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: parentId ?? undefined,
        topic: `TICKET:${interaction.user.id}`,
        permissionOverwrites,
      });

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_close').setLabel('🔒 Fechar').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ticket_delete').setLabel('🗑️ Apagar').setStyle(ButtonStyle.Danger)
      );

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle('🎫 Ticket aberto')
        .setDescription([
          `Tipo: **${tipo}**`,
          `Aberto por: <@${interaction.user.id}>`,
          '',
          'Explique seu caso com o máximo de detalhes.',
          'A equipe @Staff responderá em breve.',
        ].join('\\n'));

      await channel.send({ content: `<@${interaction.user.id}> <@&${staffRoleId}>`, embeds: [embed], components: [closeRow] });

      return interaction.reply({ content: `✅ Ticket criado: ${channel}`, ephemeral: true });
    }

    if (interaction.isButton() && (interaction.customId === 'ticket_close' || interaction.customId === 'ticket_delete')) {
      const isStaff = interaction.member.roles.cache.has(staffRoleId) || interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels);
      const isOwner = interaction.channel.topic === `TICKET:${interaction.user.id}`;
      if (!isStaff && !isOwner) {
        return interaction.reply({ content: '🚫 Você não pode executar esta ação neste ticket.', ephemeral: true });
      }

      if (interaction.customId === 'ticket_close') {
        await gerarEEnviarTranscript(interaction, 'fechado');

        // Renomeia para closed-...
        if (!interaction.channel.name.startsWith('closed-')) {
          const novoNome = (`closed-${interaction.channel.name}`).slice(0, 100);
          try { await interaction.channel.setName(novoNome); } catch {}
        }

        // Remove permissão de enviar do autor
        const ownerId = (interaction.channel.topic || '').replace('TICKET:', '');
        if (ownerId) {
          try { await interaction.channel.permissionOverwrites.edit(ownerId, { SendMessages: false }); } catch {}
        }

        await interaction.reply({ content: '🔒 Ticket fechado. Transcript enviado por DM e para a staff.', ephemeral: true });
        return;
      }

      if (interaction.customId === 'ticket_delete') {
        if (!isStaff) {
          return interaction.reply({ content: '🚫 Apenas Staff pode apagar o ticket.', ephemeral: true });
        }

        await gerarEEnviarTranscript(interaction, 'apagado');
        await interaction.reply({ content: '🗑️ Transcript enviado. Ticket será apagado em 3 segundos...', ephemeral: true });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        return;
      }
    }

    // ===== PVE =====
    if (interaction.isButton() && interaction.customId === 'verificar_pve') {
      return interaction.reply({ content: `⚔️ Vá até o canal <#${canalPVEForm}> e clique no botão **Enviar Steam ID** para cadastrar.`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'pve_enviar_steam') {
      if (pveRegistered.has(interaction.user.id)) {
        return interaction.reply({ content: '✅ Você já cadastrou sua Steam ID.', ephemeral: true });
      }
      const modal = new ModalBuilder().setCustomId('pve_modal_steam').setTitle('Cadastro PVE — Steam ID');
      const input = new TextInputBuilder().setCustomId('steamid').setLabel('Informe sua Steam ID (número)').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(32);
      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);
      await interaction.showModal(modal);
      return;
    }

    if (interaction.isModalSubmit() && interaction.customId === 'pve_modal_steam') {
      const steamId = interaction.fields.getTextInputValue('steamid').trim();
      const user = interaction.user;
      pveRegistered.add(user.id);
      try {
        const logCh = await interaction.client.channels.fetch(canalRegistroPVE);
        await logCh.send({ content: `📝 **Registro PVE**\\n**Discord:** <@${user.id}> (${user.tag})\\n**Steam ID:** ${steamId}\\n**Data:** <t:${Math.floor(Date.now()/1000)}:F>` });
      } catch (e) { console.error('Falha ao logar registro PVE:', e); }
      try {
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (member && cargoPVE) await member.roles.add(cargoPVE).catch(() => null);
      } catch {}
      await interaction.reply({ content: '✅ Steam ID registrada. Bem-vindo ao PVE!', ephemeral: true });
      return;
    }

    // ===== RP =====
    if (interaction.isButton() && interaction.customId === 'verificar_rp') {
      const user = interaction.user;
      await interaction.reply({ content: '📬 Iniciamos sua whitelist no DM. Se o DM não chegar, verifique suas configurações de privacidade.', ephemeral: true });
      const dm = await user.createDM();
      const nome = await ask(dm, user.id, 'Qual é o seu **nome**?');
      const idade = await ask(dm, user.id, 'Qual sua **idade**?');
      const steam = await ask(dm, user.id, 'Qual sua **Steam ID**?');
      const expRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('exp_sim').setLabel('Sim').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('exp_nao').setLabel('Não').setStyle(ButtonStyle.Danger)
      );
      await dm.send({ content: 'Você tem **experiência com RP**?', components: [expRow] });
      const expInteraction = await dm.awaitMessageComponent({ componentType: ComponentType.Button, filter: (i) => i.user.id === user.id, time: 5 * 60 * 1000 });
      const experiencia = expInteraction.customId === 'exp_sim' ? 'Sim' : 'Não';
      await expInteraction.update({ content: `Experiência com RP: **${experiencia}**`, components: [] });
      let historia = '';
      while (true) {
        historia = await ask(dm, user.id, 'Você pode escrever **até 250 caracteres**. Envie agora a **história do seu personagem**.');
        if (historia.length <= 250) break;
        await dm.send('⚠️ A história deve ter **no máximo 250 caracteres**. Tente novamente.');
      }
      const embed = new EmbedBuilder()
        .setColor(0x000000).setTitle('📥 Nova Whitelist (RP)')
        .addFields(
          { name: 'Usuário', value: `<@${user.id}>`, inline: false },
          { name: 'Nome', value: nome || '—', inline: true },
          { name: 'Idade', value: idade || '—', inline: true },
          { name: 'Steam ID', value: steam || '—', inline: false },
          { name: 'Experiência com RP', value: experiencia, inline: true },
          { name: 'História', value: historia || '—', inline: false }
        ).setTimestamp();
      const staffRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`wl_aprovar_${user.id}`).setLabel('✅ Aprovar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`wl_reprovar_${user.id}`).setLabel('❌ Reprovar').setStyle(ButtonStyle.Danger)
      );
      const staffChannel = await interaction.client.channels.fetch(canalWhitelistRespostas);
      await staffChannel.send({ embeds: [embed], components: [staffRow] });
      await dm.send('✅ Suas respostas foram enviadas para análise da staff. Aguarde o resultado.');
      return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('wl_aprovar_')) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return interaction.reply({ content: '🚫 Sem permissão para aprovar.', ephemeral: true });
      }
      const userId = interaction.customId.split('wl_aprovar_')[1];
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (member) {
        if (cargoRP) await member.roles.add(cargoRP).catch(console.error);
        await member.send('✅ Sua whitelist foi **aprovada**! Bem-vindo ao RP.').catch(() => null);
      }
      await interaction.reply({ content: 'Usuário aprovado.', ephemeral: true });
      return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('wl_reprovar_')) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return interaction.reply({ content: '🚫 Sem permissão para reprovar.', ephemeral: true });
      }
      const userId = interaction.customId.split('wl_reprovar_')[1];
      const modal = new ModalBuilder().setCustomId(`wl_motivo_${userId}`).setTitle('Motivo da reprovação');
      const motivo = new TextInputBuilder().setCustomId('motivo').setLabel('Explique o motivo').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(400);
      const row = new ActionRowBuilder().addComponents(motivo);
      modal.addComponents(row);
      await interaction.showModal(modal);
      return;
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('wl_motivo_')) {
      const userId = interaction.customId.split('wl_motivo_')[1];
      const motivo = interaction.fields.getTextInputValue('motivo');
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (member) await member.send(`❌ Sua whitelist foi **reprovada**.\\nMotivo: ${motivo}`).catch(() => null);
      if (canalReprovados) {
        try { const ch = await interaction.client.channels.fetch(canalReprovados); await ch.send({ content: `Usuário <@${userId}> reprovado.\\nMotivo: ${motivo}` }); } catch {}
      }
      await interaction.reply({ content: 'Reprovação registrada.', ephemeral: true });
      return;
    }
  } catch (err) {
    console.error('Erro em interactionCreate:', err);
    if (interaction?.isRepliable?.()) { try { await interaction.reply({ content: '❌ Erro ao processar sua ação. Tente novamente.', ephemeral: true }); } catch {} }
  }
});

client.login(process.env.TOKEN);