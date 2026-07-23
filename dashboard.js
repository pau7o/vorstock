/*========================================
    VORSTOCK
    DASHBOARD.JS
    Controle de Entregas + Estoque
========================================*/


// ===============================
// VERIFICAR LOGIN
// ===============================

const usuario = JSON.parse(
    localStorage.getItem("usuarioLogado")
);

if (!usuario) {
    window.location.href = "index.html";
}


// Mostrar nome do usuário

const nomeUsuario = document.getElementById("nomeUsuario");

if (nomeUsuario) {
    nomeUsuario.textContent = usuario.nome || usuario.usuario;
}


// ===============================
// LOGOUT
// ===============================

const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {
    btnLogout.addEventListener("click", function () {
        localStorage.removeItem("usuarioLogado");
        window.location.href = "index.html";
    });
}


// ===============================
// BANCO DE DADOS
// ===============================

let entregas = carregarLista("entregas");


// ===============================
// ELEMENTOS
// ===============================

const tabela = document.getElementById("tabelaEntregas");
const pesquisa = document.getElementById("pesquisa");
const btnRegistrar = document.getElementById("btnRegistrar");


// ===============================
// FUNÇÕES AUXILIARES
// ===============================

function carregarLista(chave) {
    try {
        const dados = JSON.parse(localStorage.getItem(chave));
        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        console.error(`Erro ao carregar ${chave}:`, erro);
        return [];
    }
}


function normalizarTexto(valor) {
    return String(valor || "")
        .trim()
        .toUpperCase();
}


function obterLote(item) {
    return normalizarTexto(
        item.lote ||
        item.numeroLote ||
        item.loteProduto ||
        ""
    );
}


function obterCodigo(item) {
    return normalizarTexto(
        item.codigo ||
        item.codigoProduto ||
        item.codProduto ||
        ""
    );
}


function obterQuantidade(item) {
    const quantidade = Number(item.quantidade);

    if (!Number.isFinite(quantidade)) {
        return 0;
    }

    return quantidade;
}


// ===============================
// SALVAR ENTREGAS
// ===============================

function salvarEntregas() {
    localStorage.setItem(
        "entregas",
        JSON.stringify(entregas)
    );
}


// ===============================
// SALVAR ESTOQUE
// ===============================

function salvarEstoque(estoque) {
    localStorage.setItem(
        "pastilhas",
        JSON.stringify(estoque)
    );
}


// ===============================
// GERAR ID
// ===============================

function gerarID() {
    return Date.now();
}


// ===============================
// PERMISSÕES
// ===============================

function podeExcluir(registro) {
    return (
        usuario.perfil === "Administrador" ||
        registro.criadoPor === usuario.usuario
    );
}


function podeEditar(registro) {
    return (
        usuario.perfil === "Administrador" ||
        registro.criadoPor === usuario.usuario
    );
}


// ========================================
// REGISTRAR ENTREGA + BAIXA NO ESTOQUE
// ========================================

if (btnRegistrar) {
    btnRegistrar.addEventListener(
        "click",
        registrarEntrega
    );
}


function registrarEntrega() {
    const campoOperador =
        document.getElementById("operador");

    const campoCodigo =
        document.getElementById("codigo");

    const campoLote =
        document.getElementById("lote");

    const campoQuantidade =
        document.getElementById("quantidade");


    if (
        !campoOperador ||
        !campoCodigo ||
        !campoLote ||
        !campoQuantidade
    ) {
        alert(
            "Não foi possível localizar os campos do formulário."
        );

        return;
    }


    const operador =
        campoOperador.value.trim();

    const codigo =
        normalizarTexto(campoCodigo.value);

    const lote =
        normalizarTexto(campoLote.value);

    const quantidade =
        Number(campoQuantidade.value);


    // ===============================
    // VALIDAR CAMPOS
    // ===============================

    if (
        !operador ||
        !codigo ||
        !lote ||
        !Number.isFinite(quantidade) ||
        quantidade <= 0
    ) {
        alert(
            "Preencha todos os campos corretamente."
        );

        return;
    }


    // ===============================
    // BUSCAR ESTOQUE
    // ===============================

    const estoque = carregarLista("pastilhas");


    if (estoque.length === 0) {
        alert(
            "Não existem pastilhas cadastradas no estoque."
        );

        return;
    }


    // ===============================
    // VERIFICAR CÓDIGO
    // ===============================

    const codigoExiste = estoque.some(function (item) {
        return obterCodigo(item) === codigo;
    });


    if (!codigoExiste) {
        alert(
            "Entrega não registrada!\n\n" +
            `O código "${codigo}" não está cadastrado no estoque.`
        );

        campoCodigo.focus();

        return;
    }


    // ===============================
    // BUSCAR CÓDIGO E LOTE JUNTOS
    // ===============================

    const pastilha = estoque.find(function (item) {
        return (
            obterCodigo(item) === codigo &&
            obterLote(item) === lote
        );
    });


    // ===============================
    // BLOQUEAR LOTE INEXISTENTE
    // ===============================

    if (!pastilha) {
        alert(
            "Entrega não registrada!\n\n" +
            `O lote "${lote}" não está cadastrado para o código "${codigo}".`
        );

        campoLote.value = "";
        campoLote.focus();

        return;
    }


    const quantidadeDisponivel =
        obterQuantidade(pastilha);


    // ===============================
    // VERIFICAR QUANTIDADE
    // ===============================

    if (quantidadeDisponivel <= 0) {
        alert(
            "Entrega não registrada!\n\n" +
            `O lote "${lote}" está sem estoque disponível.`
        );

        campoQuantidade.focus();

        return;
    }


    if (quantidade > quantidadeDisponivel) {
        alert(
            "Estoque insuficiente!\n\n" +
            `Código: ${codigo}\n` +
            `Lote: ${lote}\n` +
            `Disponível: ${quantidadeDisponivel}\n` +
            `Solicitado: ${quantidade}`
        );

        campoQuantidade.focus();

        return;
    }


    // ===============================
    // DAR BAIXA NO LOTE CORRETO
    // ===============================

    pastilha.quantidade =
        quantidadeDisponivel - quantidade;

    salvarEstoque(estoque);


    // ===============================
    // CRIAR REGISTRO
    // ===============================

    const agora = new Date();

    const novaEntrega = {
        id: gerarID(),

        data: agora.toLocaleDateString("pt-BR"),

        hora: agora.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        ),

        operador: operador,
        codigo: codigo,
        lote: lote,
        quantidade: quantidade,

        criadoPor:
            usuario.usuario ||
            usuario.email ||
            usuario.nome,

        criadoPorNome:
            usuario.nome ||
            usuario.usuario ||
            "Usuário",

        responsavel:
            usuario.nome ||
            usuario.usuario ||
            "Usuário"
    };


    entregas.unshift(novaEntrega);

    salvarEntregas();
    renderizar();
    limparCampos();


    alert(
        "Entrega registrada com sucesso!\n\n" +
        `Código: ${codigo}\n` +
        `Lote: ${lote}\n` +
        `Quantidade entregue: ${quantidade}\n` +
        `Saldo restante: ${pastilha.quantidade}`
    );
}


// ===============================
// LIMPAR FORMULÁRIO
// ===============================

function limparCampos() {
    const campoOperador =
        document.getElementById("operador");

    const campoCodigo =
        document.getElementById("codigo");

    const campoLote =
        document.getElementById("lote");

    const campoQuantidade =
        document.getElementById("quantidade");


    if (campoOperador) {
        campoOperador.value = "";
    }

    if (campoCodigo) {
        campoCodigo.value = "";
    }

    if (campoLote) {
        campoLote.value = "";
    }

    if (campoQuantidade) {
        campoQuantidade.value = "";
    }

    if (campoOperador) {
        campoOperador.focus();
    }
}


// ========================================
// TABELA DE ENTREGAS
// ========================================

function renderizar(filtro = "") {
    if (!tabela) {
        atualizarCards();
        return;
    }


    tabela.innerHTML = "";

    const textoFiltro =
        normalizarTexto(filtro);


    const lista = entregas.filter(function (entrega) {
        const operador =
            normalizarTexto(entrega.operador);

        const codigo =
            normalizarTexto(entrega.codigo);

        const lote =
            normalizarTexto(entrega.lote);

        return (
            operador.includes(textoFiltro) ||
            codigo.includes(textoFiltro) ||
            lote.includes(textoFiltro)
        );
    });


    if (lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="8">
                    Nenhuma entrega encontrada.
                </td>
            </tr>
        `;

        atualizarCards();

        return;
    }


    lista.forEach(function (entrega) {
        let botaoExcluir = `
            <span>Sem permissão</span>
        `;


        if (podeExcluir(entrega)) {
            botaoExcluir = `
                <button
                    type="button"
                    class="btn-excluir"
                    onclick="excluirEntrega(${entrega.id})"
                >
                    Excluir
                </button>
            `;
        }


        tabela.innerHTML += `
            <tr>
                <td>${entrega.data || "-"}</td>

                <td>${entrega.hora || "-"}</td>

                <td>${entrega.operador || "-"}</td>

                <td>${entrega.codigo || "-"}</td>

                <td>${entrega.lote || "-"}</td>

                <td>${entrega.quantidade || 0}</td>

                <td>
                    ${
                        entrega.criadoPorNome ||
                        entrega.responsavel ||
                        "-"
                    }
                </td>

                <td>
                    ${botaoExcluir}
                </td>
            </tr>
        `;
    });


    atualizarCards();
}


// ===============================
// PESQUISA
// ===============================

if (pesquisa) {
    pesquisa.addEventListener(
        "input",
        function () {
            renderizar(pesquisa.value);
        }
    );
}


// ===============================
// EXCLUIR ENTREGA
// ===============================

window.excluirEntrega = function (id) {
    const registro = entregas.find(function (entrega) {
        return Number(entrega.id) === Number(id);
    });


    if (!registro) {
        alert("Registro não encontrado.");
        return;
    }


    if (!podeExcluir(registro)) {
        alert(
            "Você não possui permissão para excluir este registro."
        );

        return;
    }


    const confirmarExclusao = confirm(
        "Deseja excluir esta entrega?\n\n" +
        `Código: ${registro.codigo}\n` +
        `Lote: ${registro.lote}\n` +
        `Quantidade: ${registro.quantidade}`
    );


    if (!confirmarExclusao) {
        return;
    }


    const estoque = carregarLista("pastilhas");


    // Busca o mesmo código e o mesmo lote.
    const pastilha = estoque.find(function (item) {
        return (
            obterCodigo(item) ===
                normalizarTexto(registro.codigo) &&

            obterLote(item) ===
                normalizarTexto(registro.lote)
        );
    });


    if (!pastilha) {
        alert(
            "Não foi possível excluir a entrega.\n\n" +
            "O código e o lote deste registro não foram encontrados no estoque."
        );

        return;
    }


    // Devolve a quantidade ao lote correto.
    pastilha.quantidade =
        obterQuantidade(pastilha) +
        Number(registro.quantidade || 0);


    salvarEstoque(estoque);


    entregas = entregas.filter(function (entrega) {
        return Number(entrega.id) !== Number(id);
    });


    salvarEntregas();
    renderizar();


    alert(
        "Entrega excluída com sucesso!\n\n" +
        "A quantidade foi devolvida ao lote correto."
    );
};


// ========================================
// CARDS DO DASHBOARD
// ========================================

function atualizarCards() {
    const totalEntregas =
        document.getElementById("totalEntregas");

    const totalOperadores =
        document.getElementById("totalOperadores");

    const totalPastilhas =
        document.getElementById("totalPastilhas");


    if (totalEntregas) {
        totalEntregas.textContent =
            entregas.length;
    }


    if (totalOperadores) {
        const operadores = new Set(
            entregas
                .map(function (entrega) {
                    return normalizarTexto(
                        entrega.operador
                    );
                })
                .filter(Boolean)
        );

        totalOperadores.textContent =
            operadores.size;
    }


    if (totalPastilhas) {
        const estoque =
            carregarLista("pastilhas");

        totalPastilhas.textContent =
            estoque.length;
    }
}


// ========================================
// INICIALIZAÇÃO
// ========================================

renderizar();
atualizarCards();


// ========================================
// DEBUG
// ========================================

console.log(
    "Usuário logado:",
    usuario
);

console.log(
    "Entregas:",
    entregas
);

console.log(
    "Estoque:",
    carregarLista("pastilhas")
);