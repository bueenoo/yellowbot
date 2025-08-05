const { exec } = require('child_process');

exec('node deploy-commands.js', (err, stdout, stderr) => {
  if (err) {
    console.error(`Erro ao executar deploy: ${err}`);
    return;
  }
  console.log(`Saída:\n${stdout}`);
  if (stderr) console.error(`Erros:\n${stderr}`);
});