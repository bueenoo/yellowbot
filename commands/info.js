const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Mostra as informações principais do servidor Black'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#000000') // Preto
      .setTitle('🖤 Bem-vindo ao servidor Black!')
      .setDescription(`🌍 **Modos disponíveis:**
・🎭 RP com whitelist obrigatória  
・⚔️ PVE liberado com verificação Steam

📩 **Suporte via tickets:**  
💰 Doações | 🚨 Denúncia | ⚙️ Técnico

🛒 **Loja automatizada:** VIPs, veículos e roupas (Pix)

Entre, sobreviva e construa sua história em Chernarus.`)
      .setFooter({ text: 'Servidor Black • DayZ RP e PVE' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
