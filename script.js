// Função para exportar os dados para um arquivo JSON
document.getElementById('botao-exportar').addEventListener('click', () => {
  fetch('/exportar-dados')
    .then(response => response.json())
    .then(data => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dados.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    })
    .catch(error => console.error('Erro ao exportar dados:', error));
});

const form = document.querySelector('form');

form.addEventListener('submit', (event) => {
event.preventDefault(); // Impede o comportamento padrão do formulário

const formData = new FormData(form);
const data = Object.fromEntries(formData.entries());

fetch('/enviar-email', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify(data),
})
.then((response) => response.json())
.then((res) => {
if (res.sucesso) {
  alert(res.mensagem); // Exibe a mensagem de sucesso
} else {
  alert(res.mensagem); // Exibe a mensagem de erro
}
form.reset(); // Limpa o formulário após o envio
})
.catch((error) => {
console.error('Erro ao enviar o formulário:', error);
alert('Email não enviado pois o(a) participante não venceu. Obrigado pela participação!');
form.reset(); // Limpa o formulário após o envio
});
});