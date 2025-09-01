require('dotenv').config();
const {
  Client, GatewayIntentBits, Partials,
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle
  MessageFlags } = require('discord.js');

const { canalVerificacao, rolePT, roleES, canalPT, canalES, canalWhitelist, canalCadastroPVE, canalEspera, canalWhitelistRespostas, canalWlReprovadoPT, canalWlReprovadoES } = require('./config.json');

const { enviarMensagemDeVerificacao } = require('./utils/verificacao');
const { buildPT } = require('./utils/verificacao-pt');
const { buildES } = require('./utils/verificacao-es');
const { startWL, handleStaffActions, handleModal } = require('./utils/wl');

const token = process.env.token;
if (!token) {
  console.error('[ERRO] Defina a variável "token" no Railway → Variables');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel],
});

client.once('clientReady', async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag} (id: ${client.user.id})`);
  try {
    await client.user.setPresence({ activities: [{ name: 'Black • verificação' }], status: 'online' });
  } catch {}
  try {
    const ch = await client.channels.fetch(canalVerificacao);
    await enviarMensagemDeVerificacao(ch);
    console.log('📌 Mensagem de idioma fixada.');
  } catch (e) {
    console.error('Falha ao enviar mensagem de idioma:', e);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  // Click idioma PT
  if (interaction.customId === 'lang_pt') {
    try {
      const role = interaction.guild.roles.cache.get(rolePT);
      if (role) await interaction.member.roles.add(role).catch(()=>{});

      const { embed, row } = buildPT();
      // edita a mensagem do embed de idioma para o fluxo em PT
      await interaction.update({ embeds: [embed], components: [row] });
    } catch (e) {
      console.error('Erro lang_pt:', e);
      if (!interaction.replied) {
        await interaction.reply({ content: '❗ Não foi possível definir o idioma.', flags: MessageFlags.Ephemeral });
      }
    }
    return;
  }

  // Click idioma ES
  if (interaction.customId === 'lang_es') {
    try {
      const role = interaction.guild.roles.cache.get(roleES);
      if (role) await interaction.member.roles.add(role).catch(()=>{});

      const { embed, row } = buildES();
      await interaction.update({ embeds: [embed], components: [row] });
    } catch (e) {
      console.error('Erro lang_es:', e);
      if (!interaction.replied) {
        await interaction.reply({ content: '❗ No fue posible definir el idioma.', flags: MessageFlags.Ephemeral });
      }
    }
    return;
  }

// Início WL PT / ES
  if (interaction.customId === 'ver_pt_rp') {
    return startWL(interaction, 'pt', { canalEspera, canalWhitelistRespostas });
  }
  if (interaction.customId === 'ver_es_rp') {
    return startWL(interaction, 'es', { canalEspera, canalWhitelistRespostas });
  }

  // Ações da staff (aprovar/reprovar)
  const acted = await handleStaffActions(interaction, { canalWhitelistRespostas, canalWlReprovadoPT, canalWlReprovadoES }, cargoRP);
  if (acted) return;
  // Fluxo PT: RP / PVE
  if (interaction.customId === 'ver_pt_pve') {
    await interaction.reply({
      content: `📄 Vá até <#${canalWhitelist}> e siga as instruções para preencher sua **whitelist** em PT.\nApós enviar, aguarde em <#1402205533272014858>.`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }
  if (interaction.customId === 'ver_pt_pve') {
    await interaction.reply({
      content: `⚔️ Para PVE em PT: envie sua **Steam ID** em <#${canalCadastroPVE}>. Após validado, seu acesso será liberado.`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  // Flujo ES: RP / PVE
  if (interaction.customId === 'ver_es_pve') {
    await interaction.reply({
      content: `📄 Ve a <#${canalWhitelist}> y completa tu **whitelist** en ES.\nLuego espera en <#1402205533272014858>.`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }
  if (interaction.customId === 'ver_es_pve') {
    await interaction.reply({
      content: `⚔️ Para PVE en ES: envía tu **Steam ID** en <#${canalCadastroPVE}>. Tras validación, tu acceso será liberado.`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }
});

(async () => {
  console.log('[LOGIN] Tentando logar...');
  try {
    await client.login(token);
    console.log('[LOGIN] Sucesso. Aguardando clientReady...');
  } catch (e) {
    console.error('[LOGIN] Falha:', e);
    process.exit(1);
  }
})();

client.on('interactionCreate', async (interaction) => {
  if (interaction.isModalSubmit()) {
    const done = await handleModal(interaction, { canalWlReprovadoPT, canalWlReprovadoES });
    if (done) return;
  }
});
