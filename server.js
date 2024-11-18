const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path'); // Para facilitar o caminho da imagem

const app = express();
const port = 3000;

// Middleware para analisar o corpo das requisições POST
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/images', express.static('images'));


// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'silvafilipecabnave@gmail.com',
    pass: 'hxjdpbvelogaojsa', // Use a senha do aplicativo gerada
  },
  tls: {
    rejectUnauthorized: false, // Permitir certificados autoassinados
  },
});

// Função para ler dados do arquivo JSON
function lerDados() {
  try {
    const dados = fs.readFileSync('dados.json', 'utf8');
    return JSON.parse(dados);
  } catch (error) {
    console.error('Erro ao ler os dados do arquivo:', error);
    return [];
  }
}

// Função para salvar dados no arquivo JSON
function salvarDados(dados) {
  try {
    fs.writeFileSync('dados.json', JSON.stringify(dados, null, 2));
  } catch (error) {
    console.error('Erro ao salvar os dados no arquivo:', error);
  }
}

// Rota para servir o formulário HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Rota para exportar dados salvos no arquivo JSON
app.get('/exportar-dados', (req, res) => {
  const dados = lerDados();
  res.json(dados);
});


// Rota para salvar dados e enviar e-mail, se necessário
app.post('/enviar-email', (req, res) => {
  const { nome, email, empresa, genero, venceu } = req.body;

  // Adicionar os dados do novo utilizador ao array
  const dados = lerDados();
  dados.push({ nome, email, empresa, genero, venceu });
  salvarDados(dados);

  // Se o utilizador venceu, enviar e-mail
  if (venceu === 'venceu') {
    // Definir o pronome correto conforme o gênero
    const saudacao = genero === 'feminino' ? 'Prezada' : 'Prezado';
    const cumprimento = genero === 'feminino' ? 'Aproveite ao máximo esta oportunidade!' : 'Aproveite ao máximo esta oportunidade!';
    const pronome = genero === 'feminino' ? 'a' : 'o';

    // Configuração do e-mail
    const mailOptions = {
      from: 'silvafilipecabnave@gmail.com',
      to: email, // Endereço para onde o e-mail será enviado
      subject: `Novo contato de ${nome}`,
      html: `
        <h2>${saudacao} ${nome},</h2>
        <p>Bom dia / Boa tarde,</p>
        <p>É com grande prazer que anunciamos que você foi ${pronome} vencedor(a) do nosso quiz de perguntas sobre a Cabnave!<br>
        Parabéns pelo seu excelente desempenho e conhecimento.</p>
        <p>Como reconhecimento pelo seu empenho, oferecemos-lhe um voucher especial! Agradecemos a sua participação entusiástica no quiz, demonstrando assim o seu interesse e dedicação à nossa empresa.</p>
        <p>Anexo a este e-mail, encontrará todos os detalhes sobre como utilizar o seu voucher.</p>
        <img src="cid:imagemDefault" alt="Imagem Padrão" />
        <p><strong>Termos e Condições para Voucher de Tour Guiado aos Estaleiros Navais da Cabnave</strong></p>
        <ol>
          <li><strong>Objeto</strong> Este voucher concede ao portador o direito a um tour guiado pelos estaleiros navais da Cabnave - Estaleiros Navais de Cabo Verde.</li>
          <li><strong>Elegibilidade</strong> A participação é aberta a todas as pessoas com idade igual ou superior a 18 anos. Funcionários da Cabnave e seus familiares diretos não são elegíveis para participar.</li>
          <li><strong>Agendamento do Tour</strong> A data do tour será marcada e comunicada via email aos ganhadores após a coordenação do número total de participantes elegíveis. Os tours serão organizados em grupos de até 10 pessoas, conforme a totalidade de ganhadores.</li>
          <li><strong>Participação no Tour</strong> Para participar do tour, os ganhadores deverão apresentar o voucher e um documento de identificação válido no dia do evento.</li>
          <li><strong>Transferibilidade</strong> Este voucher é pessoal e intransferível. Não pode ser trocado por dinheiro ou qualquer outro produto ou serviço.</li>
          <li><strong>Alterações e Cancelamentos</strong> A Cabnave reserva-se o direito de alterar a data e/ou horário do tour por motivos de força maior ou circunstâncias imprevistas.</li>
          <li><strong>Responsabilidades</strong> A Cabnave não se responsabiliza por qualquer acidente, lesão ou dano que possa ocorrer durante o tour.</li>
          <li><strong>Aceitação dos Termos</strong> A utilização deste voucher implica na aceitação plena e total de todos os termos e condições aqui descritos.</li>
        </ol>
        <p>Para mais informações ou esclarecimentos, entre em contato com a Cabnave - Estaleiros Navais de Cabo Verde através do email: <a href="mailto:comunicacao@cabnave.cv">comunicacao@cabnave.cv</a></p>
        <p><strong>${new Date().toLocaleString()}</strong></p>
        <p>${cumprimento}</p>
        <img src="cid:segundaImagem" alt="Segunda Imagem" />
      `,
      attachments: [
        {
          filename: 'voucher.png', // Nome do arquivo de imagem
          path: path.join(__dirname, 'images', 'voucher.png'), // Caminho da imagem na pasta 'images'
          cid: 'imagemDefault' // CID (Content-ID) para referenciar a imagem no HTML
        },
        {
          filename: 'assinatura.png', // Nome da segunda imagem
          path: path.join(__dirname, 'images', 'assinatura.png'), // Caminho da segunda imagem
          cid: 'segundaImagem' // CID para referenciar a segunda imagem no HTML
        }
      ],
    };

    // Envio do e-mail
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Erro ao enviar e-mail:', error);
        return res.status(500).send('Erro ao enviar e-mail');
      } else {
        console.log('E-mail enviado:', info.response);
        return res.send('Dados salvos e e-mail enviado com sucesso!');
      }
    });
  } else {
    // Se não venceu, apenas enviar uma resposta de sucesso para o salvamento
    res.send('Dados salvos com sucesso, mas você não venceu o quiz.');
  }
});

// Inicialização do servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
