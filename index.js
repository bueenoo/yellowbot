
requer ( 'dotenv' ). config ();
const { Cliente , GatewayIntentBits } = require ( 'discord.js' );
constante {
  Cliente ,
  GatewayIntentBits ,
  Parciais ,
  Construtor de linhas de ação ,
  Construtor de botões ,
  Estilo do botão ,
  Construtor de incorporação
} = requer ( 'discord.js' );
const { canalWhitelistRespostas, cargoRP } = require ( './config.json' );

const token = processo. env . token ;

const cliente = novo cliente ({
 
  intenções : [
    GatewayIntentBits . Guildas ,
    GatewayIntentBits . Mensagens da Guilda ,
    GatewayIntentBits Membros da Guilda
  ]
    GatewayIntentBits . Membros da Guilda ,
    GatewayIntentBits . Mensagens Diretas ,
    GatewayIntentBits . Conteúdo da Mensagem
  ],
  parciais : [ Parciais . Canal ]
});

cliente. uma vez ( 'pronto' , () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

cliente. em ( 'interactionCreate' , interação assíncrona => {
  se (!interação.isButton ( )) retornar ;

  se (interação. customId === 'verificar_rp' ) {
    const user = interação. usuário ;

    tentar {
      aguardar interação. responder ({
        content: '📄 Vá até o canal <#1401950755031748628> e siga as instruções para preencher sua whitelist com base na história do servidor.',
        efêmero : verdadeiro
      aguardar interação. responder ({ content : '📬 Iniciamos sua lista de permissões no DM.' , ephemeral : true });
      const dm = await usuário.createDM ()
 ;
      const filter = m => m. author . id === user. id ;
 

      constperguntar = async texto => {
 
        aguardar dm. enviar (texto);
        const coletada = await dm. awaitMessages ({ filter, max : 1 , time : 300000 });
        if (!coletada.size) thrownewError('Tempo esgotado');
  
        retornar coletada. primeiro (). conteúdo ;
      };

      const nome = awaitperguntar('Qual é o seu nome?');
 
      const idade = awaitperguntar('Qual sua idade?');
 
      const steam = awaitperguntar('Qual sua Steam ID?');
 

      const expRow = novo ActionRowBuilder (). addComponents (
 
        novo ButtonBuilder (). setCustomId ( 'exp_sim' ). setLabel ( 'Sim' ). setStyle ( ButtonStyle . Success ),
 
        newButtonBuilder().setCustomId('exp_nao').setLabel('Não').setStyle(ButtonStyle.Danger)
 
      );
      await dm.send({ content: 'Você tem experiência com RP?', components: [expRow] });
      const expInteraction = aguarde dm.awaitMessageComponent ( {
        filtro : i => i. usuário . id === usuário. id ,
        tempo : 300000
      });
      const experiencia = expInteraction.customId === 'exp_sim' ? 'Sim' : 'Não';
      await expInteraction.update({ content: `Experiência com RP: ${experiencia}`, components: [] });

      deixe a história;
      enquanto ( verdadeiro ) {
        historia = awaitperguntar('Você pode escrever até 200 caracteres. Envie agora a história do seu personagem.');
 
        se (historia. comprimento <= 200 ) quebrar ;
        await dm.send('⚠️ A história deve ter no máximo 200 caracteres. Tente novamente.');
      }

      const embed = novo EmbedBuilder ()
 
        . setColor ( '#000000' )
        . setTitle ( '📥 Nova lista de permissões' )
        . adicionar campos (
          { name: 'Usuário', value: `<@${user.id}>`, inline: false },
          { nome : 'Nome' , valor : nome, inline : true },
          { name: 'Idade', value: idade, inline: true },
          { nome : 'ID do Steam' , valor : steam, inline : false },
          { name: 'Experiência com RP', value: experiencia, inline: true },
          { name: 'História', value: historia, inline: false }
        );

      const linha = novo ActionRowBuilder (). addComponents (
 
        novo ButtonBuilder (). setCustomId ( `wl_aprovar_ ${user.id} ` ). setLabel ( '✅ Aprovar' ). setStyle ( ButtonStyle . Success ),
 
        novo ButtonBuilder (). setCustomId ( ` wl_reprovar_ ${user.id} ` ). setLabel ( '❌ Reprovar' ) . setStyle ( ButtonStyle.Danger )
 
      );

      const staffChannel = await client. channels . fetch (canalWhitelistRespostas);
      aguardar staffChannel. enviar ({ incorpora : [incorporar], componentes : [linha] });

      await dm.send('✅ Suas respostas foram enviadas para análise da staff.');
    } pegar (errar) {
      console.error('Erro ao processar RP:', err);
      console.error('Erro ao processar whitelist:', err);
      tentar {
        await user.send('❌ Ocorreu um erro ao processar sua whitelist.');
      } pegar {}
    }
  }

  se (interação. customId . começaCom ( 'wl_aprovar_' )) {
    const userId = interação. customId . split ( 'wl_aprovar_' )[ 1 ];
    const membro = aguardar interação. guilda . membros . buscar (userId). catch ( () => null );
 
    se (membro) {
      aguardar membro. funções . adicionar (cargoRP). pegar ( console . erro );
      await membro.send('✅ Sua whitelist foi aprovada!').catch(() =>null);
 
    }
    await interaction.reply({ content: 'Usuário aprovado.', ephemeral: true });
  }

  se (interação. customId . começaCom ( 'wl_reprovar_' )) {
    const userId = interação. customId . split ( 'wl_reprovar_' )[ 1 ];
    const membro = aguardar interação. guilda . membros . buscar (userId). catch ( () => null );
 
    se (membro) {
      await membro.send('❌ Sua whitelist foi reprovada.').catch(() =>null);
 
    }
    await interaction.reply({ content: 'Usuário reprovado.', ephemeral: true });
  }

  se (interação. customId === 'verificar_pve' ) {
    tentar {
      aguardar interação. responder ({
        content: '⚔️ Vá até o canal <#1401951160629461002> e envie sua Steam ID para cadastro.',
        efêmero : verdadeiro
      });
    } pegar (errar) {
      console.error('Erro ao processar PVE:', err);
    }
  }
});

cliente. login (token);
