/* =========================================
   VORSTOCK — RELATÓRIOS
========================================= */

const CHAVE_ENTREGAS = "entregas";
const CHAVE_USUARIO_LOGADO = "usuarioLogado";

let entregasFiltradas = [];


/* =========================================
   INICIAR PÁGINA
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    controlarPermissoes();
    carregarUsuarioLogado();
    configurarEventos();
    definirDataAtual();
    aplicarFiltros();
});


/* =========================================
   CONFIGURAR EVENTOS
========================================= */

function configurarEventos() {
    const btnFiltrar =
        document.getElementById("btnFiltrar");

    const btnLimparFiltros =
        document.getElementById("btnLimparFiltros");

    const btnImprimir =
        document.getElementById("btnImprimir");

    const btnExportarPDF =
        document.getElementById("btnExportarPDF");

    const btnLogout =
        document.getElementById("btnLogout");

    const filtroOperador =
        document.getElementById("filtroOperador");

    const filtroCodigo =
        document.getElementById("filtroCodigo");

    const dataInicial =
        document.getElementById("dataInicial");

    const dataFinal =
        document.getElementById("dataFinal");


    if (btnFiltrar) {
        btnFiltrar.addEventListener(
            "click",
            aplicarFiltros
        );
    }

    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener(
            "click",
            limparFiltros
        );
    }

    if (btnImprimir) {
        btnImprimir.addEventListener(
            "click",
            imprimirRelatorio
        );
    }

    if (btnExportarPDF) {
        btnExportarPDF.addEventListener(
            "click",
            exportarPDF
        );
    }

    if (btnLogout) {
        btnLogout.addEventListener(
            "click",
            realizarLogout
        );
    }

    if (filtroOperador) {
        filtroOperador.addEventListener(
            "input",
            aplicarFiltros
        );
    }

    if (filtroCodigo) {
        filtroCodigo.addEventListener(
            "input",
            aplicarFiltros
        );
    }

    if (dataInicial) {
        dataInicial.addEventListener(
            "change",
            aplicarFiltros
        );
    }

    if (dataFinal) {
        dataFinal.addEventListener(
            "change",
            aplicarFiltros
        );
    }
}


/* =========================================
   BUSCAR ENTREGAS
========================================= */

function buscarEntregas() {
    try {
        const dados =
            localStorage.getItem(CHAVE_ENTREGAS);

        if (!dados) {
            return [];
        }

        const entregas = JSON.parse(dados);

        return Array.isArray(entregas)
            ? entregas
            : [];

    } catch (erro) {
        console.error(
            "Erro ao buscar entregas:",
            erro
        );

        return [];
    }
}


/* =========================================
   USUÁRIO LOGADO
========================================= */

function obterUsuarioLogado() {
    try {
        const dados =
            localStorage.getItem(
                CHAVE_USUARIO_LOGADO
            );

        if (!dados) {
            return null;
        }

        const usuario = JSON.parse(dados);

        if (
            !usuario ||
            typeof usuario !== "object"
        ) {
            return null;
        }

        return usuario;

    } catch (erro) {
        console.error(
            "Erro ao carregar usuário:",
            erro
        );

        return null;
    }
}


/* =========================================
   CONTROLE DE PERMISSÕES
========================================= */

function controlarPermissoes() {
    const usuario =
        obterUsuarioLogado();

    const perfil = String(
        usuario?.perfil || ""
    )
        .trim()
        .toLowerCase();

    const status = String(
        usuario?.status || "ativo"
    )
        .trim()
        .toLowerCase();

    const administrador =
        perfil === "administrador" &&
        status === "ativo";

    document
        .querySelectorAll(".admin-only")
        .forEach(function (item) {
            if (!administrador) {
                item.remove();
            }
        });
}


/* =========================================
   CARREGAR USUÁRIO NA SIDEBAR
========================================= */

function carregarUsuarioLogado() {
    const usuario =
        obterUsuarioLogado();

    if (!usuario) {
        return;
    }

    const nome =
        usuario.nome ||
        usuario.usuario ||
        "Usuário";

    atualizarTextoElemento(
        "nomeUsuarioLogado",
        nome
    );

    atualizarTextoElemento(
        "perfilUsuarioLogado",
        usuario.perfil || "VorStock"
    );

    atualizarTextoElemento(
        "avatarUsuario",
        nome.charAt(0).toUpperCase()
    );
}


/* =========================================
   DEFINIR DATA ATUAL
========================================= */

function definirDataAtual() {
    const hoje =
        obterDataAtualISO();

    const dataInicial =
        document.getElementById(
            "dataInicial"
        );

    const dataFinal =
        document.getElementById(
            "dataFinal"
        );

    if (dataInicial) {
        dataInicial.value = hoje;
    }

    if (dataFinal) {
        dataFinal.value = hoje;
    }
}


/* =========================================
   APLICAR FILTROS
========================================= */

function aplicarFiltros() {
    const entregas =
        buscarEntregas();

    const dataInicial =
        document.getElementById(
            "dataInicial"
        )?.value || "";

    const dataFinal =
        document.getElementById(
            "dataFinal"
        )?.value || "";

    const operador =
        document.getElementById(
            "filtroOperador"
        )?.value
            .trim()
            .toLowerCase() || "";

    const codigoOuLote =
        document.getElementById(
            "filtroCodigo"
        )?.value
            .trim()
            .toLowerCase() || "";

    if (
        dataInicial &&
        dataFinal &&
        dataInicial > dataFinal
    ) {
        alert(
            "A data inicial não pode ser maior que a data final."
        );

        return;
    }

    entregasFiltradas = entregas.filter(
        function (entrega) {
            const dataEntrega =
                converterDataParaISO(
                    entrega.data
                );

            const operadorEntrega =
                String(
                    entrega.operador || ""
                )
                    .trim()
                    .toLowerCase();

            const codigoEntrega =
                String(
                    entrega.codigo || ""
                )
                    .trim()
                    .toLowerCase();

            const loteEntrega =
                String(
                    entrega.lote || ""
                )
                    .trim()
                    .toLowerCase();

            const correspondeDataInicial =
                !dataInicial ||
                (
                    dataEntrega &&
                    dataEntrega >= dataInicial
                );

            const correspondeDataFinal =
                !dataFinal ||
                (
                    dataEntrega &&
                    dataEntrega <= dataFinal
                );

            const correspondeOperador =
                !operador ||
                operadorEntrega.includes(
                    operador
                );

            const correspondeCodigo =
                !codigoOuLote ||
                codigoEntrega.includes(
                    codigoOuLote
                ) ||
                loteEntrega.includes(
                    codigoOuLote
                );

            return (
                correspondeDataInicial &&
                correspondeDataFinal &&
                correspondeOperador &&
                correspondeCodigo
            );
        }
    );

    entregasFiltradas.sort(
        ordenarEntregasMaisRecentes
    );

    renderizarTabela();
    atualizarCards();
    atualizarTextoResultado();
}


/* =========================================
   LIMPAR FILTROS
========================================= */

function limparFiltros() {
    const campos = [
        "dataInicial",
        "dataFinal",
        "filtroOperador",
        "filtroCodigo"
    ];

    campos.forEach(function (id) {
        const elemento =
            document.getElementById(id);

        if (elemento) {
            elemento.value = "";
        }
    });

    aplicarFiltros();
}


/* =========================================
   RENDERIZAR TABELA
========================================= */

function renderizarTabela() {
    const tabela =
        document.getElementById(
            "tabelaRelatorios"
        );

    if (!tabela) {
        return;
    }

    tabela.innerHTML = "";

    if (entregasFiltradas.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="mensagem-vazia"
                >
                    Nenhuma entrega encontrada.
                </td>
            </tr>
        `;

        return;
    }

    entregasFiltradas.forEach(
        function (entrega) {
            const linha =
                document.createElement("tr");

            const quantidade =
                Number(entrega.quantidade) || 0;

            linha.innerHTML = `
                <td>
                    ${escaparHTML(
                        formatarDataParaExibicao(
                            entrega.data
                        )
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        entrega.hora || "-"
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        entrega.operador || "-"
                    )}
                </td>

                <td class="codigo">
                    ${escaparHTML(
                        entrega.codigo || "-"
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        entrega.lote || "-"
                    )}
                </td>

                <td>
                    <span class="quantidade">
                        ${escaparHTML(
                            quantidade
                        )}
                    </span>
                </td>

                <td>
                    ${escaparHTML(
                        entrega.criadoPorNome ||
                        entrega.criadoPor ||
                        "-"
                    )}
                </td>
            `;

            tabela.appendChild(linha);
        }
    );
}


/* =========================================
   ATUALIZAR CARDS
========================================= */

function atualizarCards() {
    const totalEntregas =
        entregasFiltradas.length;

    const totalItens =
        calcularTotalItens();

    const operadores =
        obterOperadoresUnicos();

    const codigos =
        obterCodigosUnicos();

    atualizarTextoElemento(
        "totalEntregas",
        totalEntregas
    );

    atualizarTextoElemento(
        "totalItensEntregues",
        totalItens
    );

    atualizarTextoElemento(
        "totalOperadores",
        operadores.length
    );

    atualizarTextoElemento(
        "totalCodigos",
        codigos.length
    );
}


/* =========================================
   CALCULAR TOTAL DE ITENS
========================================= */

function calcularTotalItens() {
    return entregasFiltradas.reduce(
        function (total, entrega) {
            return total +
                (
                    Number(
                        entrega.quantidade
                    ) || 0
                );
        },
        0
    );
}


/* =========================================
   OPERADORES ÚNICOS
========================================= */

function obterOperadoresUnicos() {
    return [
        ...new Set(
            entregasFiltradas
                .map(function (entrega) {
                    return String(
                        entrega.operador || ""
                    )
                        .trim()
                        .toLowerCase();
                })
                .filter(Boolean)
        )
    ];
}


/* =========================================
   CÓDIGOS ÚNICOS
========================================= */

function obterCodigosUnicos() {
    return [
        ...new Set(
            entregasFiltradas
                .map(function (entrega) {
                    return String(
                        entrega.codigo || ""
                    )
                        .trim()
                        .toLowerCase();
                })
                .filter(Boolean)
        )
    ];
}


/* =========================================
   TEXTO DO RESULTADO
========================================= */

function atualizarTextoResultado() {
    const elemento =
        document.getElementById(
            "textoResultado"
        );

    if (!elemento) {
        return;
    }

    const total =
        entregasFiltradas.length;

    if (total === 0) {
        elemento.textContent =
            "Nenhuma entrega encontrada.";

        return;
    }

    if (total === 1) {
        elemento.textContent =
            "1 entrega encontrada.";

        return;
    }

    elemento.textContent =
        `${total} entregas encontradas.`;
}


/* =========================================
   IMPRIMIR
========================================= */

function imprimirRelatorio() {
    if (entregasFiltradas.length === 0) {
        alert(
            "Não existem entregas para imprimir."
        );

        return;
    }

    window.print();
}


/* =========================================
   EXPORTAR PDF
========================================= */

async function exportarPDF() {
    if (entregasFiltradas.length === 0) {
        alert(
            "Não existem entregas para exportar."
        );

        return;
    }

    const botao =
        document.getElementById(
            "btnExportarPDF"
        );

    const textoOriginal =
        botao?.textContent || "Exportar PDF";

    try {
        if (botao) {
            botao.disabled = true;
            botao.textContent =
                "Gerando PDF...";
        }

        await carregarBibliotecasPDF();

        gerarArquivoPDF();

    } catch (erro) {
        console.error(
            "Erro ao gerar PDF:",
            erro
        );

        alert(
            "Não foi possível gerar o PDF. Verifique sua conexão com a internet e tente novamente."
        );

    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent =
                textoOriginal;
        }
    }
}


/* =========================================
   CARREGAR BIBLIOTECAS DO PDF
========================================= */

async function carregarBibliotecasPDF() {
    if (!window.jspdf) {
        await carregarScript(
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
            "biblioteca-jspdf"
        );
    }

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {
        throw new Error(
            "A biblioteca jsPDF não foi carregada."
        );
    }

    const testePDF =
        new window.jspdf.jsPDF();

    if (
        typeof testePDF.autoTable !==
        "function"
    ) {
        await carregarScript(
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.4/jspdf.plugin.autotable.min.js",
            "biblioteca-jspdf-autotable"
        );
    }
}


/* =========================================
   CARREGAR SCRIPT EXTERNO
========================================= */

function carregarScript(url, id) {
    return new Promise(
        function (resolve, reject) {
            const scriptExistente =
                document.getElementById(id);

            if (scriptExistente) {
                if (
                    scriptExistente.dataset
                        .carregado === "true"
                ) {
                    resolve();
                    return;
                }

                scriptExistente.addEventListener(
                    "load",
                    resolve,
                    { once: true }
                );

                scriptExistente.addEventListener(
                    "error",
                    reject,
                    { once: true }
                );

                return;
            }

            const script =
                document.createElement("script");

            script.id = id;
            script.src = url;
            script.async = true;

            script.addEventListener(
                "load",
                function () {
                    script.dataset.carregado =
                        "true";

                    resolve();
                }
            );

            script.addEventListener(
                "error",
                function () {
                    reject(
                        new Error(
                            `Erro ao carregar: ${url}`
                        )
                    );
                }
            );

            document.head.appendChild(script);
        }
    );
}


/* =========================================
   GERAR ARQUIVO PDF
========================================= */

function gerarArquivoPDF() {
    const { jsPDF } =
        window.jspdf;

    const documento =
        new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

    const usuario =
        obterUsuarioLogado();

    const nomeUsuario =
        usuario?.nome ||
        usuario?.usuario ||
        "Usuário não identificado";

    const perfilUsuario =
        usuario?.perfil ||
        "Perfil não informado";

    const agora =
        new Date();

    const dataGeracao =
        agora.toLocaleDateString("pt-BR");

    const horaGeracao =
        agora.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    const totalEntregas =
        entregasFiltradas.length;

    const totalItens =
        calcularTotalItens();

    const totalOperadores =
        obterOperadoresUnicos().length;

    const totalCodigos =
        obterCodigosUnicos().length;

    const filtros =
        obterDescricaoFiltros();

    const colunas = [
        "Data",
        "Hora",
        "Operador",
        "Código",
        "Lote",
        "Quantidade",
        "Registrado por"
    ];

    const linhas =
        entregasFiltradas.map(
            function (entrega) {
                return [
                    formatarDataParaExibicao(
                        entrega.data
                    ),

                    entrega.hora || "-",

                    entrega.operador || "-",

                    entrega.codigo || "-",

                    entrega.lote || "-",

                    String(
                        Number(
                            entrega.quantidade
                        ) || 0
                    ),

                    entrega.criadoPorNome ||
                    entrega.criadoPor ||
                    "-"
                ];
            }
        );

    documento.autoTable({
        head: [colunas],

        body: linhas,

        startY: 61,

        margin: {
            top: 61,
            right: 12,
            bottom: 18,
            left: 12
        },

        theme: "grid",

        styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: 2.5,
            textColor: [31, 41, 55],
            lineColor: [210, 216, 224],
            lineWidth: 0.2,
            valign: "middle"
        },

        headStyles: {
            fillColor: [20, 84, 166],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center"
        },

        alternateRowStyles: {
            fillColor: [246, 248, 252]
        },

        columnStyles: {
            0: {
                cellWidth: 25,
                halign: "center"
            },

            1: {
                cellWidth: 19,
                halign: "center"
            },

            2: {
                cellWidth: 48
            },

            3: {
                cellWidth: 37
            },

            4: {
                cellWidth: 36
            },

            5: {
                cellWidth: 25,
                halign: "center"
            },

            6: {
                cellWidth: 52
            }
        },

        didDrawPage: function (dados) {
            desenharCabecalhoPDF(
                documento,
                {
                    nomeUsuario,
                    perfilUsuario,
                    dataGeracao,
                    horaGeracao,
                    filtros,
                    totalEntregas,
                    totalItens,
                    totalOperadores,
                    totalCodigos
                }
            );

            desenharMarcaDaguaPDF(
                documento
            );

            desenharRodapePDF(
                documento,
                dados.pageNumber,
                dataGeracao,
                horaGeracao,
                nomeUsuario
            );
        }
    });

    const dataArquivo =
        obterDataArquivo(agora);

    const horaArquivo =
        obterHoraArquivo(agora);

    const nomeArquivo =
        `relatorio-vorstock-${dataArquivo}-${horaArquivo}.pdf`;

    documento.save(nomeArquivo);
}


/* =========================================
   CABEÇALHO DO PDF
========================================= */

function desenharCabecalhoPDF(
    documento,
    dados
) {
    const larguraPagina =
        documento.internal.pageSize.getWidth();

    documento.setFillColor(
        15,
        23,
        42
    );

    documento.rect(
        0,
        0,
        larguraPagina,
        20,
        "F"
    );

    documento.setTextColor(
        255,
        255,
        255
    );

    documento.setFont(
        "helvetica",
        "bold"
    );

    documento.setFontSize(17);

    documento.text(
        "VORSTOCK",
        12,
        9
    );

    documento.setFontSize(8);

    documento.setFont(
        "helvetica",
        "normal"
    );

    documento.text(
        "Gestão Inteligente de Materiais",
        12,
        14
    );

    documento.setFont(
        "helvetica",
        "bold"
    );

    documento.setFontSize(11);

    documento.text(
        "VORTECH",
        larguraPagina - 12,
        9,
        {
            align: "right"
        }
    );

    documento.setFont(
        "helvetica",
        "normal"
    );

    documento.setFontSize(7);

    documento.text(
        "Tecnologia e Soluções",
        larguraPagina - 12,
        14,
        {
            align: "right"
        }
    );

    documento.setTextColor(
        17,
        24,
        39
    );

    documento.setFont(
        "helvetica",
        "bold"
    );

    documento.setFontSize(14);

    documento.text(
        "RELATÓRIO DE ENTREGAS",
        12,
        29
    );

    documento.setFont(
        "helvetica",
        "normal"
    );

    documento.setFontSize(8);

    documento.setTextColor(
        75,
        85,
        99
    );

    documento.text(
        `Gerado por: ${dados.nomeUsuario} — ${dados.perfilUsuario}`,
        12,
        35
    );

    documento.text(
        `Data: ${dados.dataGeracao}  |  Horário: ${dados.horaGeracao}`,
        12,
        40
    );

    documento.text(
        `Filtros: ${dados.filtros}`,
        12,
        45
    );

    desenharCardResumo(
        documento,
        12,
        49,
        61,
        "ENTREGAS",
        dados.totalEntregas
    );

    desenharCardResumo(
        documento,
        79,
        49,
        61,
        "ITENS ENTREGUES",
        dados.totalItens
    );

    desenharCardResumo(
        documento,
        146,
        49,
        61,
        "OPERADORES",
        dados.totalOperadores
    );

    desenharCardResumo(
        documento,
        213,
        49,
        71,
        "CÓDIGOS",
        dados.totalCodigos
    );
}


/* =========================================
   CARD DE RESUMO NO PDF
========================================= */

function desenharCardResumo(
    documento,
    x,
    y,
    largura,
    titulo,
    valor
) {
    documento.setFillColor(
        241,
        245,
        249
    );

    documento.setDrawColor(
        203,
        213,
        225
    );

    documento.roundedRect(
        x,
        y,
        largura,
        9,
        1.5,
        1.5,
        "FD"
    );

    documento.setFont(
        "helvetica",
        "normal"
    );

    documento.setFontSize(6.5);

    documento.setTextColor(
        100,
        116,
        139
    );

    documento.text(
        titulo,
        x + 3,
        y + 3.5
    );

    documento.setFont(
        "helvetica",
        "bold"
    );

    documento.setFontSize(10);

    documento.setTextColor(
        15,
        23,
        42
    );

    documento.text(
        String(valor),
        x + 3,
        y + 7.5
    );
}


/* =========================================
   MARCA-D'ÁGUA DO PDF
========================================= */

function desenharMarcaDaguaPDF(documento) {
    const larguraPagina =
        documento.internal.pageSize.getWidth();

    const alturaPagina =
        documento.internal.pageSize.getHeight();

    documento.saveGraphicsState();

    if (
        typeof documento.GState ===
        "function"
    ) {
        documento.setGState(
            new documento.GState({
                opacity: 0.045
            })
        );
    }

    documento.setTextColor(
        30,
        64,
        175
    );

    documento.setFont(
        "helvetica",
        "bold"
    );

    documento.setFontSize(39);

    documento.text(
        "VORSTOCK",
        larguraPagina / 2,
        alturaPagina / 2 - 5,
        {
            align: "center",
            angle: 35
        }
    );

    documento.setFontSize(24);

    documento.text(
        "VORTECH",
        larguraPagina / 2,
        alturaPagina / 2 + 14,
        {
            align: "center",
            angle: 35
        }
    );

    documento.restoreGraphicsState();
}


/* =========================================
   RODAPÉ DO PDF
========================================= */

function desenharRodapePDF(
    documento,
    pagina,
    dataGeracao,
    horaGeracao,
    nomeUsuario
) {
    const larguraPagina =
        documento.internal.pageSize.getWidth();

    const alturaPagina =
        documento.internal.pageSize.getHeight();

    documento.setDrawColor(
        203,
        213,
        225
    );

    documento.line(
        12,
        alturaPagina - 13,
        larguraPagina - 12,
        alturaPagina - 13
    );

    documento.setFont(
        "helvetica",
        "normal"
    );

    documento.setFontSize(7);

    documento.setTextColor(
        100,
        116,
        139
    );

    documento.text(
        "VorStock — Gestão Inteligente de Materiais | Desenvolvido por Vortech © 2026",
        12,
        alturaPagina - 8
    );

    documento.text(
        `Gerado em ${dataGeracao} às ${horaGeracao} por ${nomeUsuario}`,
        larguraPagina / 2,
        alturaPagina - 8,
        {
            align: "center"
        }
    );

    documento.text(
        `Página ${pagina}`,
        larguraPagina - 12,
        alturaPagina - 8,
        {
            align: "right"
        }
    );
}


/* =========================================
   DESCRIÇÃO DOS FILTROS
========================================= */

function obterDescricaoFiltros() {
    const dataInicial =
        document.getElementById(
            "dataInicial"
        )?.value || "";

    const dataFinal =
        document.getElementById(
            "dataFinal"
        )?.value || "";

    const operador =
        document.getElementById(
            "filtroOperador"
        )?.value.trim() || "";

    const codigo =
        document.getElementById(
            "filtroCodigo"
        )?.value.trim() || "";

    const filtros = [];

    if (dataInicial) {
        filtros.push(
            `início ${formatarDataParaExibicao(
                dataInicial
            )}`
        );
    }

    if (dataFinal) {
        filtros.push(
            `fim ${formatarDataParaExibicao(
                dataFinal
            )}`
        );
    }

    if (operador) {
        filtros.push(
            `operador "${operador}"`
        );
    }

    if (codigo) {
        filtros.push(
            `código/lote "${codigo}"`
        );
    }

    if (filtros.length === 0) {
        return "Todos os registros";
    }

    return filtros.join(" | ");
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

    window.location.href =
        "index.html";
}


/* =========================================
   ORDENAR ENTREGAS
========================================= */

function ordenarEntregasMaisRecentes(
    entregaA,
    entregaB
) {
    const dataA =
        criarDataCompletaEntrega(
            entregaA
        );

    const dataB =
        criarDataCompletaEntrega(
            entregaB
        );

    return dataB - dataA;
}


/* =========================================
   CRIAR DATA COMPLETA
========================================= */

function criarDataCompletaEntrega(entrega) {
    const dataISO =
        converterDataParaISO(
            entrega.data
        );

    const hora =
        normalizarHora(
            entrega.hora
        );

    if (!dataISO) {
        return new Date(0);
    }

    const data =
        new Date(
            `${dataISO}T${hora}`
        );

    if (Number.isNaN(data.getTime())) {
        return new Date(0);
    }

    return data;
}


/* =========================================
   CONVERTER DATA PARA ISO
========================================= */

function converterDataParaISO(data) {
    if (!data) {
        return "";
    }

    const texto =
        String(data).trim();

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(texto)
    ) {
        return texto;
    }

    if (
        /^\d{2}\/\d{2}\/\d{4}$/.test(texto)
    ) {
        const partes =
            texto.split("/");

        return (
            partes[2] +
            "-" +
            partes[1] +
            "-" +
            partes[0]
        );
    }

    return "";
}


/* =========================================
   FORMATAR DATA PARA EXIBIÇÃO
========================================= */

function formatarDataParaExibicao(data) {
    if (!data) {
        return "-";
    }

    const texto =
        String(data).trim();

    if (
        /^\d{2}\/\d{2}\/\d{4}$/.test(texto)
    ) {
        return texto;
    }

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(texto)
    ) {
        const partes =
            texto.split("-");

        return (
            partes[2] +
            "/" +
            partes[1] +
            "/" +
            partes[0]
        );
    }

    return texto;
}


/* =========================================
   NORMALIZAR HORA
========================================= */

function normalizarHora(hora) {
    if (!hora) {
        return "00:00:00";
    }

    const texto =
        String(hora).trim();

    if (
        /^\d{2}:\d{2}$/.test(texto)
    ) {
        return `${texto}:00`;
    }

    if (
        /^\d{2}:\d{2}:\d{2}$/.test(texto)
    ) {
        return texto;
    }

    return "00:00:00";
}


/* =========================================
   DATA ATUAL EM ISO
========================================= */

function obterDataAtualISO() {
    const hoje =
        new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoje.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


/* =========================================
   DATA PARA NOME DO ARQUIVO
========================================= */

function obterDataArquivo(data) {
    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


/* =========================================
   HORA PARA NOME DO ARQUIVO
========================================= */

function obterHoraArquivo(data) {
    const hora =
        String(
            data.getHours()
        ).padStart(2, "0");

    const minuto =
        String(
            data.getMinutes()
        ).padStart(2, "0");

    const segundo =
        String(
            data.getSeconds()
        ).padStart(2, "0");

    return `${hora}-${minuto}-${segundo}`;
}


/* =========================================
   ATUALIZAR TEXTO DO ELEMENTO
========================================= */

function atualizarTextoElemento(id, valor) {
    const elemento =
        document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor;
    }
}


/* =========================================
   ESCAPAR HTML
========================================= */

function escaparHTML(valor) {
    const elemento =
        document.createElement("div");

    elemento.textContent =
        String(valor ?? "");

    return elemento.innerHTML;
}