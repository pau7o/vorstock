/*========================================
    VORSTOCK
    LOGIN.JS
========================================*/


/* ===============================
   CHAVES DO LOCALSTORAGE
=============================== */

const CHAVE_USUARIOS = "usuarios";
const CHAVE_USUARIO_LOGADO = "usuarioLogado";
const CHAVE_LEMBRAR_USUARIO = "lembrarUsuario";


/* ===============================
   INICIAR PÁGINA
=============================== */

document.addEventListener("DOMContentLoaded", function () {
    garantirUsuarioAdministrador();
    verificarSessaoExistente();
    carregarUsuarioSalvo();
    configurarEventos();
});


/* ===============================
   CONFIGURAR EVENTOS
=============================== */

function configurarEventos() {
    const formulario =
        document.getElementById("formLogin");

    const btnEntrar =
        document.getElementById("btnEntrar");

    const btnMostrarSenha =
        document.getElementById("btnMostrarSenha");

    const campoUsuario =
        document.getElementById("usuario");

    const campoSenha =
        document.getElementById("senha");

    if (formulario) {
        formulario.addEventListener(
            "submit",
            function (evento) {
                evento.preventDefault();
                realizarLogin();
            }
        );
    }

    if (btnEntrar && !formulario) {
        btnEntrar.addEventListener(
            "click",
            realizarLogin
        );
    }

    if (btnMostrarSenha) {
        btnMostrarSenha.addEventListener(
            "click",
            alternarVisibilidadeSenha
        );
    }

    if (campoUsuario) {
        campoUsuario.addEventListener(
            "input",
            limparMensagemErro
        );
    }

    if (campoSenha) {
        campoSenha.addEventListener(
            "input",
            limparMensagemErro
        );
    }
}


/* ===============================
   REALIZAR LOGIN
=============================== */

function realizarLogin() {
    const campoUsuario =
        document.getElementById("usuario");

    const campoSenha =
        document.getElementById("senha");

    const checkboxLembrar =
        document.getElementById(
            "lembrarUsuario"
        );

    const btnEntrar =
        document.getElementById(
            "btnEntrar"
        );

    const usuarioDigitado =
        String(
            campoUsuario?.value || ""
        ).trim();

    const senhaDigitada =
        String(
            campoSenha?.value || ""
        );

    limparMensagemErro();

    if (!usuarioDigitado) {
        mostrarErro(
            "Informe o seu usuário."
        );

        campoUsuario?.focus();
        return;
    }

    if (!senhaDigitada) {
        mostrarErro(
            "Informe a sua senha."
        );

        campoSenha?.focus();
        return;
    }

    definirEstadoBotao(
        btnEntrar,
        true
    );

    setTimeout(function () {
        const usuarios =
            buscarUsuarios();

        const usuarioEncontrado =
            usuarios.find(
                function (usuario) {
                    return (
                        normalizarTexto(
                            usuario.usuario
                        ) ===
                        normalizarTexto(
                            usuarioDigitado
                        )
                    );
                }
            );

        if (!usuarioEncontrado) {
            falhaLogin(
                btnEntrar,
                campoSenha,
                "Usuário ou senha inválidos."
            );

            return;
        }

        const status =
            normalizarTexto(
                usuarioEncontrado.status ||
                "ativo"
            );

        if (status !== "ativo") {
            falhaLogin(
                btnEntrar,
                campoSenha,
                "Este usuário está inativo. Procure um administrador."
            );

            return;
        }

        if (
            String(
                usuarioEncontrado.senha
            ) !== senhaDigitada
        ) {
            falhaLogin(
                btnEntrar,
                campoSenha,
                "Usuário ou senha inválidos."
            );

            return;
        }

        salvarSessao(
            usuarioEncontrado
        );

        salvarPreferenciaUsuario(
            usuarioDigitado,
            checkboxLembrar?.checked
        );

        /*
            O index.html e o dashboard.html
            estão dentro da mesma pasta html.
        */

        window.location.href =
            "dashboard.html";

    }, 350);
}


/* ===============================
   TRATAR FALHA NO LOGIN
=============================== */

function falhaLogin(
    botao,
    campoSenha,
    mensagem
) {
    definirEstadoBotao(
        botao,
        false
    );

    mostrarErro(mensagem);

    if (campoSenha) {
        campoSenha.value = "";
        campoSenha.focus();
    }
}


/* ===============================
   BUSCAR USUÁRIOS
=============================== */

function buscarUsuarios() {
    try {
        const dados =
            localStorage.getItem(
                CHAVE_USUARIOS
            );

        if (!dados) {
            return [];
        }

        const usuarios =
            JSON.parse(dados);

        return Array.isArray(usuarios)
            ? usuarios
            : [];

    } catch (erro) {
        console.error(
            "Erro ao carregar usuários:",
            erro
        );

        return [];
    }
}


/* ===============================
   GARANTIR ADMINISTRADOR
=============================== */

function garantirUsuarioAdministrador() {
    const usuarios =
        buscarUsuarios();

    if (usuarios.length > 0) {
        return;
    }

    const administrador = {
        id: "admin",

        nome:
            "Administrador",

        usuario:
            "admin",

        senha:
            "admin",

        perfil:
            "Administrador",

        status:
            "Ativo",

        dataCadastro:
            new Date().toLocaleDateString(
                "pt-BR"
            )
    };

    localStorage.setItem(
        CHAVE_USUARIOS,
        JSON.stringify([
            administrador
        ])
    );
}


/* ===============================
   SALVAR SESSÃO
=============================== */

function salvarSessao(usuario) {
    const usuarioLogado = {
        id:
            usuario.id ||
            gerarId(),

        nome:
            usuario.nome ||
            usuario.usuario ||
            "Usuário",

        usuario:
            usuario.usuario,

        perfil:
            usuario.perfil ||
            "Almoxarife",

        status:
            usuario.status ||
            "Ativo",

        dataLogin:
            new Date().toISOString()
    };

    localStorage.setItem(
        CHAVE_USUARIO_LOGADO,
        JSON.stringify(
            usuarioLogado
        )
    );
}


/* ===============================
   VERIFICAR SESSÃO EXISTENTE
=============================== */

function verificarSessaoExistente() {
    const usuarioLogado =
        obterUsuarioLogado();

    if (!usuarioLogado) {
        return;
    }

    const status =
        normalizarTexto(
            usuarioLogado.status ||
            "ativo"
        );

    if (status !== "ativo") {
        localStorage.removeItem(
            CHAVE_USUARIO_LOGADO
        );

        return;
    }

    /*
        Como o index.html está na pasta html,
        o dashboard está no mesmo nível.
    */

    window.location.href =
        "dashboard.html";
}


/* ===============================
   OBTER USUÁRIO LOGADO
=============================== */

function obterUsuarioLogado() {
    try {
        const dados =
            localStorage.getItem(
                CHAVE_USUARIO_LOGADO
            );

        if (!dados) {
            return null;
        }

        const usuario =
            JSON.parse(dados);

        if (
            !usuario ||
            typeof usuario !== "object"
        ) {
            return null;
        }

        return usuario;

    } catch (erro) {
        localStorage.removeItem(
            CHAVE_USUARIO_LOGADO
        );

        return null;
    }
}


/* ===============================
   LEMBRAR USUÁRIO
=============================== */

function salvarPreferenciaUsuario(
    usuario,
    lembrar
) {
    if (lembrar) {
        localStorage.setItem(
            CHAVE_LEMBRAR_USUARIO,
            usuario
        );

        return;
    }

    localStorage.removeItem(
        CHAVE_LEMBRAR_USUARIO
    );
}


/* ===============================
   CARREGAR USUÁRIO SALVO
=============================== */

function carregarUsuarioSalvo() {
    const campoUsuario =
        document.getElementById(
            "usuario"
        );

    const campoSenha =
        document.getElementById(
            "senha"
        );

    const checkboxLembrar =
        document.getElementById(
            "lembrarUsuario"
        );

    const usuarioSalvo =
        localStorage.getItem(
            CHAVE_LEMBRAR_USUARIO
        );

    if (
        usuarioSalvo &&
        campoUsuario
    ) {
        campoUsuario.value =
            usuarioSalvo;

        if (checkboxLembrar) {
            checkboxLembrar.checked =
                true;
        }

        campoSenha?.focus();
        return;
    }

    campoUsuario?.focus();
}


/* ===============================
   MOSTRAR OU OCULTAR SENHA
=============================== */

function alternarVisibilidadeSenha() {
    const campoSenha =
        document.getElementById(
            "senha"
        );

    const btnMostrarSenha =
        document.getElementById(
            "btnMostrarSenha"
        );

    if (
        !campoSenha ||
        !btnMostrarSenha
    ) {
        return;
    }

    const senhaEstaVisivel =
        campoSenha.type === "text";

    if (senhaEstaVisivel) {
        campoSenha.type =
            "password";

        btnMostrarSenha.textContent =
            "👁";

        btnMostrarSenha.title =
            "Mostrar senha";

        btnMostrarSenha.setAttribute(
            "aria-label",
            "Mostrar senha"
        );

    } else {
        campoSenha.type =
            "text";

        btnMostrarSenha.textContent =
            "🙈";

        btnMostrarSenha.title =
            "Ocultar senha";

        btnMostrarSenha.setAttribute(
            "aria-label",
            "Ocultar senha"
        );
    }

    campoSenha.focus();
}


/* ===============================
   MOSTRAR ERRO
=============================== */

function mostrarErro(mensagem) {
    const elementoErro =
        document.getElementById(
            "erro"
        );

    if (!elementoErro) {
        alert(mensagem);
        return;
    }

    elementoErro.textContent =
        mensagem;

    elementoErro.classList.add(
        "erro-ativo"
    );
}


/* ===============================
   LIMPAR ERRO
=============================== */

function limparMensagemErro() {
    const elementoErro =
        document.getElementById(
            "erro"
        );

    if (!elementoErro) {
        return;
    }

    elementoErro.textContent = "";

    elementoErro.classList.remove(
        "erro-ativo"
    );
}


/* ===============================
   ESTADO DO BOTÃO
=============================== */

function definirEstadoBotao(
    botao,
    carregando
) {
    if (!botao) {
        return;
    }

    if (carregando) {
        botao.disabled = true;

        botao.innerHTML = `
            <span>Entrando...</span>
            <span class="login-carregando"></span>
        `;

        return;
    }

    botao.disabled = false;

    botao.innerHTML = `
        <span>Entrar no sistema</span>
        <span class="btn-seta">→</span>
    `;
}


/* ===============================
   NORMALIZAR TEXTO
=============================== */

function normalizarTexto(valor) {
    return String(valor || "")
        .trim()
        .toLowerCase();
}


/* ===============================
   GERAR ID
=============================== */

function gerarId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
        "function"
    ) {
        return window.crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );
}