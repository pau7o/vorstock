/* =========================================
   VORSTOCK — USUÁRIOS
========================================= */

const CHAVE_USUARIOS = "usuarios";
const CHAVE_USUARIO_LOGADO = "usuarioLogado";

let usuarioEmEdicao = null;


/* =========================================
   INICIAR PÁGINA
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const usuarioLogado = obterUsuarioLogado();

    /*
       Impede o acesso direto ao usuarios.html
       por pessoas que não são administradoras.
    */
    if (!usuarioLogado) {
        alert("Você precisa entrar no sistema.");

        window.location.replace("index.html");
        return;
    }

    if (!ehAdministrador(usuarioLogado)) {
        alert(
            "Acesso negado. Somente administradores podem acessar a página de usuários."
        );

        window.location.replace("dashboard.html");
        return;
    }

    controlarMenuUsuarios();
    carregarUsuarioNaSidebar();
    configurarEventos();
    renderizarUsuarios();
});


/* =========================================
   USUÁRIO LOGADO E PERMISSÕES
========================================= */

function obterUsuarioLogado() {
    try {
        const dados = localStorage.getItem(CHAVE_USUARIO_LOGADO);

        if (!dados) {
            return null;
        }

        const usuario = JSON.parse(dados);

        if (!usuario || typeof usuario !== "object") {
            return null;
        }

        return usuario;
    } catch (erro) {
        console.error("Erro ao obter usuário logado:", erro);
        return null;
    }
}


function ehAdministrador(usuario) {
    if (!usuario) {
        return false;
    }

    const perfil = String(usuario.perfil || "")
        .trim()
        .toLowerCase();

    const status = String(usuario.status || "ativo")
        .trim()
        .toLowerCase();

    return perfil === "administrador" && status === "ativo";
}


function controlarMenuUsuarios() {
    const usuarioLogado = obterUsuarioLogado();

    const linksUsuarios = document.querySelectorAll(
        'a[href="usuarios.html"], #menuUsuarios, .admin-only'
    );

    linksUsuarios.forEach(function (link) {
        if (!ehAdministrador(usuarioLogado)) {
            link.style.display = "none";
        } else {
            link.style.display = "";
        }
    });
}


/* =========================================
   EVENTOS
========================================= */

function configurarEventos() {
    const botaoCadastrar =
        document.getElementById("btnCadastrarUsuario");

    const campoPesquisa =
        document.getElementById("pesquisaUsuarios");

    const botaoLogout =
        document.getElementById("btnLogout");

    if (botaoCadastrar) {
        botaoCadastrar.addEventListener(
            "click",
            cadastrarOuEditarUsuario
        );
    }

    if (campoPesquisa) {
        campoPesquisa.addEventListener("input", function () {
            renderizarUsuarios(campoPesquisa.value);
        });
    }

    if (botaoLogout) {
        botaoLogout.addEventListener(
            "click",
            realizarLogout
        );
    }
}


/* =========================================
   LOCALSTORAGE
========================================= */

function buscarUsuarios() {
    try {
        const dados = localStorage.getItem(CHAVE_USUARIOS);

        if (!dados) {
            return [];
        }

        const usuarios = JSON.parse(dados);

        return Array.isArray(usuarios)
            ? usuarios
            : [];
    } catch (erro) {
        console.error("Erro ao buscar usuários:", erro);
        return [];
    }
}


function salvarUsuarios(usuarios) {
    try {
        localStorage.setItem(
            CHAVE_USUARIOS,
            JSON.stringify(usuarios)
        );

        return true;
    } catch (erro) {
        console.error("Erro ao salvar usuários:", erro);

        alert("Não foi possível salvar os usuários.");

        return false;
    }
}


/* =========================================
   CADASTRAR OU EDITAR
========================================= */

function cadastrarOuEditarUsuario() {
    const campoNome =
        document.getElementById("nome");

    const campoUsuario =
        document.getElementById("usuario");

    const campoSenha =
        document.getElementById("senha");

    const campoConfirmarSenha =
        document.getElementById("confirmarSenha");

    const campoPerfil =
        document.getElementById("perfil");

    const campoStatus =
        document.getElementById("status");

    if (
        !campoNome ||
        !campoUsuario ||
        !campoSenha ||
        !campoConfirmarSenha ||
        !campoPerfil ||
        !campoStatus
    ) {
        alert(
            "Erro: os campos do formulário não foram encontrados."
        );

        return;
    }

    const nome = campoNome.value.trim();
    const nomeUsuario = campoUsuario.value.trim();
    const senha = campoSenha.value;
    const confirmarSenha = campoConfirmarSenha.value;
    const perfil = campoPerfil.value.trim();
    const status = campoStatus.value.trim();

    if (!nome) {
        alert("Digite o nome completo.");

        campoNome.focus();
        return;
    }

    if (!nomeUsuario) {
        alert("Digite o nome de usuário.");

        campoUsuario.focus();
        return;
    }

    if (nomeUsuario.length < 3) {
        alert(
            "O nome de usuário deve possuir pelo menos 3 caracteres."
        );

        campoUsuario.focus();
        return;
    }

    if (!perfil) {
        alert("Selecione o perfil.");

        campoPerfil.focus();
        return;
    }

    if (!status) {
        alert("Selecione o status.");

        campoStatus.focus();
        return;
    }

    const usuarios = buscarUsuarios();

    const usuarioDuplicado = usuarios.some(function (item) {
        const mesmoNome =
            String(item.usuario || "")
                .trim()
                .toLowerCase() ===
            nomeUsuario.toLowerCase();

        return (
            mesmoNome &&
            String(item.id) !== String(usuarioEmEdicao)
        );
    });

    if (usuarioDuplicado) {
        alert(
            "Já existe um usuário com esse nome de acesso."
        );

        campoUsuario.focus();
        return;
    }

    /*
       NOVO USUÁRIO
    */

    if (usuarioEmEdicao === null) {
        if (!senha) {
            alert("Digite uma senha.");

            campoSenha.focus();
            return;
        }

        if (senha.length < 4) {
            alert(
                "A senha deve possuir pelo menos 4 caracteres."
            );

            campoSenha.focus();
            return;
        }

        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem.");

            campoConfirmarSenha.focus();
            return;
        }

        const novoUsuario = {
            id: gerarId(),
            nome: nome,
            usuario: nomeUsuario,
            senha: senha,
            perfil: perfil,
            status: status,
            dataCadastro:
                new Date().toLocaleDateString("pt-BR"),
            criadoEm:
                new Date().toISOString()
        };

        usuarios.push(novoUsuario);

        if (!salvarUsuarios(usuarios)) {
            return;
        }

        alert("Usuário cadastrado com sucesso.");
    } else {
        /*
           EDITAR USUÁRIO
        */

        const indice = usuarios.findIndex(function (item) {
            return String(item.id) ===
                String(usuarioEmEdicao);
        });

        if (indice === -1) {
            alert("Usuário não encontrado.");

            limparFormulario();
            return;
        }

        if (senha || confirmarSenha) {
            if (senha.length < 4) {
                alert(
                    "A senha deve possuir pelo menos 4 caracteres."
                );

                campoSenha.focus();
                return;
            }

            if (senha !== confirmarSenha) {
                alert("As senhas não coincidem.");

                campoConfirmarSenha.focus();
                return;
            }

            usuarios[indice].senha = senha;
        }

        usuarios[indice].nome = nome;
        usuarios[indice].usuario = nomeUsuario;
        usuarios[indice].perfil = perfil;
        usuarios[indice].status = status;
        usuarios[indice].atualizadoEm =
            new Date().toISOString();

        if (!salvarUsuarios(usuarios)) {
            return;
        }

        alert("Usuário atualizado com sucesso.");
    }

    limparFormulario();
    renderizarUsuarios();
}


/* =========================================
   RENDERIZAR TABELA
========================================= */

function renderizarUsuarios(filtro = "") {
    const tabela =
        document.getElementById("tabelaUsuarios");

    if (!tabela) {
        console.error(
            'Elemento com id "tabelaUsuarios" não encontrado.'
        );

        return;
    }

    const usuarios = buscarUsuarios();

    const pesquisa = String(filtro)
        .trim()
        .toLowerCase();

    const usuariosFiltrados = usuarios.filter(
        function (item) {
            const nome =
                String(item.nome || "").toLowerCase();

            const usuario =
                String(item.usuario || "").toLowerCase();

            const perfil =
                String(item.perfil || "").toLowerCase();

            const status =
                String(item.status || "").toLowerCase();

            return (
                nome.includes(pesquisa) ||
                usuario.includes(pesquisa) ||
                perfil.includes(pesquisa) ||
                status.includes(pesquisa)
            );
        }
    );

    tabela.innerHTML = "";

    if (usuariosFiltrados.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="6">
                    ${
                        pesquisa
                            ? "Nenhum usuário encontrado."
                            : "Nenhum usuário cadastrado."
                    }
                </td>
            </tr>
        `;

        atualizarCards(usuarios);
        return;
    }

    usuariosFiltrados.forEach(function (item) {
        const linha = document.createElement("tr");

        const statusNormalizado =
            String(item.status || "")
                .trim()
                .toLowerCase();

        const classeStatus =
            statusNormalizado === "ativo"
                ? "status-ativo"
                : "status-inativo";

        linha.innerHTML = `
            <td>
                ${escaparHTML(item.nome)}
            </td>

            <td>
                ${escaparHTML(item.usuario)}
            </td>

            <td>
                <span class="perfil">
                    ${escaparHTML(item.perfil)}
                </span>
            </td>

            <td>
                <span class="status ${classeStatus}">
                    ${escaparHTML(item.status)}
                </span>
            </td>

            <td>
                ${escaparHTML(item.dataCadastro || "-")}
            </td>

            <td>
                <div class="acoes">

                    <button
                        type="button"
                        class="btn-editar"
                        data-id="${escaparHTML(item.id)}"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        class="btn-excluir"
                        data-id="${escaparHTML(item.id)}"
                    >
                        Excluir
                    </button>

                </div>
            </td>
        `;

        tabela.appendChild(linha);
    });

    configurarBotoesTabela();
    atualizarCards(usuarios);
}


/* =========================================
   BOTÕES DA TABELA
========================================= */

function configurarBotoesTabela() {
    const botoesEditar =
        document.querySelectorAll(".btn-editar");

    const botoesExcluir =
        document.querySelectorAll(".btn-excluir");

    botoesEditar.forEach(function (botao) {
        botao.addEventListener("click", function () {
            editarUsuario(botao.dataset.id);
        });
    });

    botoesExcluir.forEach(function (botao) {
        botao.addEventListener("click", function () {
            excluirUsuario(botao.dataset.id);
        });
    });
}


/* =========================================
   EDITAR
========================================= */

function editarUsuario(id) {
    const usuarios = buscarUsuarios();

    const usuarioEncontrado = usuarios.find(
        function (item) {
            return String(item.id) === String(id);
        }
    );

    if (!usuarioEncontrado) {
        alert("Usuário não encontrado.");
        return;
    }

    usuarioEmEdicao = String(id);

    document.getElementById("nome").value =
        usuarioEncontrado.nome || "";

    document.getElementById("usuario").value =
        usuarioEncontrado.usuario || "";

    document.getElementById("senha").value = "";

    document.getElementById(
        "confirmarSenha"
    ).value = "";

    document.getElementById("perfil").value =
        usuarioEncontrado.perfil || "";

    document.getElementById("status").value =
        usuarioEncontrado.status || "Ativo";

    const botaoCadastrar =
        document.getElementById("btnCadastrarUsuario");

    if (botaoCadastrar) {
        botaoCadastrar.textContent =
            "Salvar alterações";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   EXCLUIR
========================================= */

function excluirUsuario(id) {
    const usuarios = buscarUsuarios();

    const usuarioEncontrado = usuarios.find(
        function (item) {
            return String(item.id) === String(id);
        }
    );

    if (!usuarioEncontrado) {
        alert("Usuário não encontrado.");
        return;
    }

    /*
       Evita excluir o administrador principal.
    */

    const ehAdminPrincipal =
        String(usuarioEncontrado.usuario || "")
            .trim()
            .toLowerCase() === "admin";

    if (ehAdminPrincipal) {
        alert(
            "O administrador principal não pode ser excluído."
        );

        return;
    }

    const confirmou = confirm(
        `Deseja excluir o usuário "${usuarioEncontrado.nome}"?`
    );

    if (!confirmou) {
        return;
    }

    const usuariosAtualizados = usuarios.filter(
        function (item) {
            return String(item.id) !== String(id);
        }
    );

    if (!salvarUsuarios(usuariosAtualizados)) {
        return;
    }

    if (
        String(usuarioEmEdicao) === String(id)
    ) {
        limparFormulario();
    }

    renderizarUsuarios();

    alert("Usuário excluído com sucesso.");
}


/* =========================================
   CARDS
========================================= */

function atualizarCards(usuarios) {
    const elementoTotal =
        document.getElementById("totalUsuarios");

    const elementoAdministradores =
        document.getElementById(
            "totalAdministradores"
        );

    const elementoAtivos =
        document.getElementById(
            "totalUsuariosAtivos"
        );

    const administradores = usuarios.filter(
        function (item) {
            return (
                String(item.perfil || "")
                    .trim()
                    .toLowerCase() ===
                "administrador"
            );
        }
    ).length;

    const ativos = usuarios.filter(function (item) {
        return (
            String(item.status || "")
                .trim()
                .toLowerCase() === "ativo"
        );
    }).length;

    if (elementoTotal) {
        elementoTotal.textContent =
            usuarios.length;
    }

    if (elementoAdministradores) {
        elementoAdministradores.textContent =
            administradores;
    }

    if (elementoAtivos) {
        elementoAtivos.textContent = ativos;
    }
}


/* =========================================
   LIMPAR FORMULÁRIO
========================================= */

function limparFormulario() {
    usuarioEmEdicao = null;

    const formularioCampos = [
        "nome",
        "usuario",
        "senha",
        "confirmarSenha"
    ];

    formularioCampos.forEach(function (id) {
        const campo = document.getElementById(id);

        if (campo) {
            campo.value = "";
        }
    });

    const campoPerfil =
        document.getElementById("perfil");

    const campoStatus =
        document.getElementById("status");

    const botaoCadastrar =
        document.getElementById("btnCadastrarUsuario");

    if (campoPerfil) {
        campoPerfil.value = "";
    }

    if (campoStatus) {
        campoStatus.value = "Ativo";
    }

    if (botaoCadastrar) {
        botaoCadastrar.textContent =
            "Cadastrar usuário";
    }
}


/* =========================================
   SIDEBAR
========================================= */

function carregarUsuarioNaSidebar() {
    const usuarioLogado = obterUsuarioLogado();

    const nomeElemento =
        document.getElementById(
            "nomeUsuarioLogado"
        );

    const perfilElemento =
        document.getElementById(
            "perfilUsuarioLogado"
        );

    if (nomeElemento) {
        nomeElemento.textContent =
            usuarioLogado.nome ||
            usuarioLogado.usuario ||
            "Usuário";
    }

    if (perfilElemento) {
        perfilElemento.textContent =
            usuarioLogado.perfil ||
            "VorStock";
    }
}


/* =========================================
   LOGOUT
========================================= */

function realizarLogout() {
    const confirmou = confirm(
        "Deseja realmente sair do sistema?"
    );

    if (!confirmou) {
        return;
    }

    localStorage.removeItem(
        CHAVE_USUARIO_LOGADO
    );

    window.location.href = "index.html";
}


/* =========================================
   AUXILIARES
========================================= */

function gerarId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return (
        Date.now().toString() +
        Math.random().toString(16).slice(2)
    );
}


function escaparHTML(valor) {
    const elemento =
        document.createElement("div");

    elemento.textContent =
        String(valor ?? "");

    return elemento.innerHTML;
}