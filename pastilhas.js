/* ==========================================
   ALMOXCONTROL - ESTOQUE DE PASTILHAS
========================================== */


// LOGIN

const usuarioLogado = JSON.parse(
    localStorage.getItem("usuarioLogado")
);


if (!usuarioLogado) {
    window.location.href = "index.html";
}


// Mostrar nome

const campoNome = document.getElementById("nomeUsuario");

if(campoNome){
    campoNome.innerHTML = usuarioLogado.nome;
}



// BANCO

let pastilhas = JSON.parse(
    localStorage.getItem("pastilhas")
) || [];




// ELEMENTOS

const btn = document.getElementById("btnCadastrarPastilha");

const tabela = document.getElementById("tabelaPastilhas");



// FUNÇÃO SALVAR

function salvarPastilhas(){

    localStorage.setItem(
        "pastilhas",
        JSON.stringify(pastilhas)
    );

}




// CADASTRAR

btn.onclick = function(){


    let codigo =
    document.getElementById("codigo").value;


    let descricao =
    document.getElementById("descricao").value;


    let fabricante =
    document.getElementById("fabricante").value;


    let lote =
    document.getElementById("lote").value;


    let quantidade =
    document.getElementById("quantidade").value;


    let minimo =
    document.getElementById("estoqueMinimo").value;



    if(
        codigo=="" ||
        descricao=="" ||
        fabricante=="" ||
        lote=="" ||
        quantidade=="" ||
        minimo==""
    ){

        alert("Preencha todos os campos");

        return;

    }




    let nova = {


        id: Date.now(),


        codigo: codigo.toUpperCase(),


        descricao: descricao,


        fabricante: fabricante,


        lote: lote,


        quantidade: Number(quantidade),


        minimo: Number(minimo),


        usuario:
        usuarioLogado.nome


    };




    pastilhas.push(nova);



    salvarPastilhas();


    listar();



    limpar();



    alert("Pastilha cadastrada!");

};






// LISTAR

function listar(){


    tabela.innerHTML="";



    pastilhas.forEach(function(p){



        let status;



        if(p.quantidade <= p.minimo){


            status =
            "⚠ Estoque baixo";


        }else{


            status =
            "Normal";


        }





        tabela.innerHTML += `


        <tr>

        <td>${p.codigo}</td>

        <td>${p.descricao}</td>

        <td>${p.fabricante}</td>

        <td>${p.lote}</td>

        <td>${p.quantidade}</td>

        <td>${status}</td>

        <td>

        <button onclick="remover(${p.id})">
        Excluir
        </button>


        </td>


        </tr>


        `;



    });



    atualizar();



}







// ATUALIZAR CARDS

function atualizar(){



    let total =
    document.getElementById("totalPastilhas");


    let baixo =
    document.getElementById("estoqueBaixo");


    let quantidade =
    document.getElementById("quantidadeTotal");



    if(total){

        total.innerHTML =
        pastilhas.length;

    }



    if(baixo){


        baixo.innerHTML =

        pastilhas.filter(function(p){

            return p.quantidade <= p.minimo;

        }).length;


    }



    if(quantidade){


        let soma=0;


        pastilhas.forEach(function(p){

            soma += p.quantidade;

        });


        quantidade.innerHTML=soma;


    }


}






// EXCLUIR


function remover(id){



    let confirmar =
    confirm("Excluir esta pastilha?");



    if(confirmar){


        pastilhas = pastilhas.filter(function(p){

            return p.id != id;

        });



        salvarPastilhas();


        listar();


    }


}


window.remover = remover;






// LIMPAR

function limpar(){


document.getElementById("codigo").value="";

document.getElementById("descricao").value="";

document.getElementById("fabricante").value="";

document.getElementById("lote").value="";

document.getElementById("quantidade").value="";

document.getElementById("estoqueMinimo").value="";


}






// INICIAR

listar();