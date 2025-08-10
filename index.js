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
} = require('discord.js');

const {
  canalWhitelistRespostas,
  canalPVEForm,
  canalReprovados,
  canalRegistroPVE,
  cargoRP,
  cargoPVE,
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

// Carrega comandos para executar e para registrar
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'));
const commandMap = new Map();
const commandData = [];
for (const file of commandFiles) {
  const mod = require(path.join(__dirname, 'commands', file));
  if (mod?.data?.name && typeof mod.execute === 'function') {
    commandMap.set(mod.data.name, mod);
  }
  if (mod?.data?.toJSON) commandData.push(mod.data.toJSON());
}

client.once('ready', async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);

  // Auto-registra para todas as guilds em que o bot está
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    const guilds = client.guilds.cache.map(g => g.id);
    for (const gid of guilds) {
      console.log(`⏳ Registrando ${commandData.length} comando(s) na guild ${gid}...`);
      await rest.put(Routes.applicationGuildCommands(client.application.id, gid), { body: commandData });
      console.log(`✅ Comandos registrados em ${gid}`);
    }
  } catch (e) {
    console.error('❌ Falha ao registrar comandos após login:', e);
  }
});

// Cache simples para impedir múltiplos cadastros PVE por usuário durante o uptime
const pveRegistered = new Set();

async function ask(dm, userId, text, timeMs = 5 * 60 * 1000) {
  await dm.send(text);
  const collected = await dm.awaitMessages({ filter: (m) => m.author.id === userId, max: 1, time: timeMs });
  if (!collected.size) throw new Error('Tempo esgotado');
  return collected.first().content?.trim() || '';
}

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = commandMap.get(interaction.commandName);
      if (cmd) return cmd.execute(interaction);
      return;
    }

    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

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
        await logCh.send({ content: `📝 **Registro PVE**\n**Discord:** <@${user.id}> (${user.tag})\n**Steam ID:** ${steamId}\n**Data:** <t:${Math.floor(Date.now()/1000)}:F>` });
      } catch (e) { console.error('Falha ao logar registro PVE:', e); }
      try {
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (member && cargoPVE) await member.roles.add(cargoPVE).catch(() => null);
      } catch {}
      await interaction.reply({ content: '✅ Steam ID registrada. Bem-vindo ao PVE!', ephemeral: true });
      return;
    }

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
      if (member) await member.send(`❌ Sua whitelist foi **reprovada**.\nMotivo: ${motivo}`).catch(() => null);
      if (canalReprovados) {
        try { const ch = await interaction.client.channels.fetch(canalReprovados); await ch.send({ content: `Usuário <@${userId}> reprovado.\nMotivo: ${motivo}` }); } catch {}
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
