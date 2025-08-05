const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Mostra as informações principais do servidor Black'),

  async execute(interaction) {
    if (interaction.channelId !== '1402172138395271239') {
      return interaction.reply({ content: '❗ Este comando só pode ser usado no canal oficial de informações.', flags: 64 });
    }

    const onlineCount = interaction.guild.members.cache.filter(m => m.presence && m.presence.status !== 'offline').size;

    const embed = new EmbedBuilder()
      .setColor('#000000')
      .setTitle('🖤 Bem-vindo ao servidor Black!')
      .setDescription(`🌍 **Modos disponíveis:**
・🎭 RP com whitelist obrigatória  
・⚔️ PVE liberado com verificação Steam

📡 **Endereços dos servidores:**
・RP: \`192.168.0.10:2302\`
・PVE: \`192.168.0.11:2302\`

👥 **Jogadores online no Discord:** ${onlineCount}

📩 **Suporte via tickets:**  
💰 Doações | 🚨 Denúncia | ⚙️ Técnico

🛒 **Loja automatizada:** VIPs, veículos e roupas (Pix)

Entre, sobreviva e construa sua história em Chernarus.`)
      .setFooter({ text: 'Servidor Black • DayZ RP e PVE' });

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};