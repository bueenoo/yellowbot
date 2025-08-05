
require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const { canalWhitelistRespostas, cargoRP } = require('./config.json');

const token = process.env.token;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once('ready', () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'verificar_rp') {
    const user = interaction.user;

    try {
      await interaction.reply({ content: '📬 Iniciamos sua whitelist no DM.', ephemeral: true });
      const dm = await user.createDM();
      const filter = m => m.author.id === user.id;

      await dm.send('Qual é o seu nome?');
      const nome = (await dm.awaitMessages({ filter, max: 1, time: 300000 })).first().content;

      await dm.send('Qual sua idade?');
      const idade = (await dm.awaitMessages({ filter, max: 1, time: 300000 })).first().content;

      await dm.send('Qual sua Steam ID?');
      const steam = (await dm.awaitMessages({ filter, max: 1, time: 300000 })).first().content;

      const expRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('exp_sim').setLabel('Sim').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('exp_nao').setLabel('Não').setStyle(ButtonStyle.Danger)
      );
      await dm.send({ content: 'Você tem experiência com RP?', components: [expRow] });
      const expInteraction = await dm.awaitMessageComponent({
        filter: i => i.user.id === user.id,
        time: 300000
      });
      const experiencia = expInteraction.customId === 'exp_sim' ? 'Sim' : 'Não';
      await expInteraction.update({ content: `Experiência com RP: ${experiencia}`, components: [] });

      let historia;
      while (true) {
        await dm.send('Você pode escrever até 200 caracteres. Envie agora a história do seu personagem.');
        const collected = await dm.awaitMessages({ filter, max: 1, time: 300000 });
        if (!collected.size) throw new Error('Tempo esgotado');
        const conteudo = collected.first().content;
        if (conteudo.length <= 200) {
          historia = conteudo;
          break;
        }
        await dm.send('⚠️ A história deve ter no máximo 200 caracteres. Tente novamente.');
      }

      const embed = new EmbedBuilder()
        .setColor('#000000')
        .setTitle('📥 Nova Whitelist')
        .addFields(
          { name: 'Usuário', value: `<@${user.id}>`, inline: false },
          { name: 'Nome', value: nome, inline: true },
          { name: 'Idade', value: idade, inline: true },
          { name: 'Steam ID', value: steam, inline: false },
          { name: 'Experiência com RP', value: experiencia, inline: true },
          { name: 'História', value: historia, inline: false }
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`wl_aprovar_${user.id}`).setLabel('✅ Aprovar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`wl_reprovar_${user.id}`).setLabel('❌ Reprovar').setStyle(ButtonStyle.Danger)
      );

      const staffChannel = await client.channels.fetch(canalWhitelistRespostas);
      await staffChannel.send({ embeds: [embed], components: [row] });

      await dm.send('✅ Suas respostas foram enviadas para análise da staff.');
    } catch (err) {
      console.error('Erro ao processar whitelist:', err);
      try {
        await user.send('❌ Ocorreu um erro ao processar sua whitelist.');
      } catch {}
    }
  }

  if (interaction.customId.startsWith('wl_aprovar_')) {
    const userId = interaction.customId.split('wl_aprovar_')[1];
    const membro = await interaction.guild.members.fetch(userId).catch(() => null);
    if (membro) {
      await membro.roles.add(cargoRP).catch(console.error);
      await membro.send('✅ Sua whitelist foi aprovada!').catch(() => null);
    }
    await interaction.reply({ content: 'Usuário aprovado.', ephemeral: true });
  }

  if (interaction.customId.startsWith('wl_reprovar_')) {
    const userId = interaction.customId.split('wl_reprovar_')[1];
    const membro = await interaction.guild.members.fetch(userId).catch(() => null);
    if (membro) {
      await membro.send('❌ Sua whitelist foi reprovada.').catch(() => null);
    }
    await interaction.reply({ content: 'Usuário reprovado.', ephemeral: true });
  }

  if (interaction.customId === 'verificar_pve') {
    try {
      await interaction.reply({
        content: '⚔️ Vá até o canal <#1401951160629461002> e envie sua Steam ID para cadastro.',
        ephemeral: true
      });
    } catch (err) {
      console.error('Erro ao processar PVE:', err);
    }
  }
});

client.login(token);
