const campoSenha = document.querySelector('#campo-senha');
const quantidadeTexto = document.querySelector('#quantidade');

const botaoDiminuir = document.querySelector('#diminuir');
const botaoAumentar = document.querySelector('#aumentar');
const botaoGerar = document.querySelector('#gerar-senha');
const botaoCopiar = document.querySelector('#copiar-senha');

const mensagem = document.querySelector('#mensagem');
const preenchimentoForca = document.querySelector('#forca-preenchimento');
const textoForca = document.querySelector('#texto-forca');

const opcoes = {
    maiusculas: document.querySelector('#maiusculas'),
    minusculas: document.querySelector('#minusculas'),
    numeros: document.querySelector('#numeros'),
    simbolos: document.querySelector('#simbolos')
};

let quantidade = 12;

const minimo = 4;
const maximo = 64;

const conjuntos = {
    maiusculas: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    minusculas: 'abcdefghijklmnopqrstuvwxyz',
    numeros: '0123456789',
    simbolos: '!@#$%&*()-_=+[]{};:,.?'
};

// Atualiza a quantidade de caracteres
function atualizarQuantidade() {
    quantidadeTexto.textContent = quantidade;

    botaoDiminuir.disabled = quantidade <= minimo;
    botaoAumentar.disabled = quantidade >= maximo;
}

// Escolhe um caractere aleatório
function escolherCaracteres(conjunto) {
    if (window.crypto && window.crypto.getRandomValues) {
        const valor = new Uint32Array(1);
        window.crypto.getRandomValues(valor);

        return conjunto[valor[0] % conjunto.length];
    }

    return conjunto[Math.floor(Math.random() * conjunto.length)];
}

// Embaralha os caracteres da senha
function embaralhar(caracteres) {
    for (let i = caracteres.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [caracteres[i], caracteres[j]] =
            [caracteres[j], caracteres[i]];
    }

    return caracteres;
}

// Gera uma senha aleatória
function gerarSenha() {
    const selecionados = Object.keys(opcoes).filter(
        nome => opcoes[nome].checked
    );

    if (selecionados.length === 0) {
        campoSenha.value = '';
        mensagem.textContent =
            'Selecione pelo menos uma característica.';
        atualizarForca('');
        return;
    }

    mensagem.textContent = '';

    const caracteresDisponiveis = selecionados
        .map(nome => conjuntos[nome])
        .join('');

    const senha = [];

    // Garante um caractere de cada tipo selecionado
    selecionados.forEach(nome => {
        senha.push(escolherCaracteres(conjuntos[nome]));
    });

    // Completa a senha até atingir o tamanho escolhido
    while (senha.length < quantidade) {
        senha.push(escolherCaracteres(caracteresDisponiveis));
    }

    campoSenha.value = embaralhar(senha)
        .slice(0, quantidade)
        .join('');

    atualizarForca(campoSenha.value);
}

// Analisa a força estimada da senha
function atualizarForca(senha) {
    const categorias = [
        /[A-Z]/.test(senha),
        /[a-z]/.test(senha),
        /[0-9]/.test(senha),
        /[^A-Za-z0-9]/.test(senha)
    ].filter(Boolean).length;

    let nivel = 'Fraca';
    let largura = '25%';
    let cor = '#ff4141';

    if (senha.length >= 12 && categorias >= 3) {
        nivel = 'Forte';
        largura = '100%';
        cor = '#28d17c';
    } else if (senha.length >= 8 && categorias >= 2) {
        nivel = 'Média';
        largura = '60%';
        cor = '#ffc247';
    }

    preenchimentoForca.style.width = senha ? largura : '0%';
    preenchimentoForca.style.backgroundColor = cor;
    textoForca.textContent = senha ? nivel : '—';
}

// Botão para diminuir a quantidade
botaoDiminuir.addEventListener('click', () => {
    if (quantidade > minimo) {
        quantidade--;
        atualizarQuantidade();
        gerarSenha();
    }
});

// Botão para aumentar a quantidade
botaoAumentar.addEventListener('click', () => {
    if (quantidade < maximo) {
        quantidade++;
        atualizarQuantidade();
        gerarSenha();
    }
});

// Gera uma nova senha ao alterar as opções
Object.values(opcoes).forEach(opcao => {
    opcao.addEventListener('change', gerarSenha);
});

// Botão para gerar outra senha
botaoGerar.addEventListener('click', gerarSenha);

// Copia a senha para a área de transferência
botaoCopiar.addEventListener('click', async () => {
    if (!campoSenha.value) {
        mensagem.textContent = 'Gere uma senha antes de copiar.';
        return;
    }

    try {
        await navigator.clipboard.writeText(campoSenha.value);
        mensagem.textContent = 'Senha copiada!';
    } catch {
        campoSenha.select();

        const copiou = document.execCommand('copy');

        mensagem.textContent = copiou
            ? 'Senha copiada!'
            : 'Selecione a senha e copie manualmente.';
    }
});

// Inicializa o gerador
atualizarQuantidade();
gerarSenha();
