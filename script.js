// ##################################################################
// # CONFIGURAÇÃO DA API DO CONTENTFUL
// ##################################################################
const spaceId = 'pusavj4b0ybx';
const accessToken = 'knsoFyXohlck3hu9veCzUctMXWK74f4sVnNsLZEz1EI';

// Variáveis globais para o slider
let slides = [];
let currentSlide = 0;


// ##################################################################
// # FUNÇÃO PRINCIPAL QUE RODA QUANDO A PÁGINA CARREGA
// ##################################################################
document.addEventListener('DOMContentLoaded', () => {
    carregarServicos();
    carregarResultados();
});


// ##################################################################
// # FUNÇÃO PARA BUSCAR E RENDERIZAR OS SERVIÇOS E PREÇOS
// ##################################################################
async function carregarServicos() {
    // Monta a URL da API para buscar as entradas do tipo 'servico'
    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=servico&order=fields.preco`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Falha ao carregar os serviços.');
        
        const data = await response.json();
        const assets = new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields]));

        // Seleciona os containers no HTML onde os preços serão inseridos
        const limpezasGrid = document.getElementById('limpezas-grid');
        const limpezasOutrosGrid = document.getElementById('limpezas-outros-grid');
        const restauracoesGrid = document.getElementById('restauracoes-grid');
        const extrasGrid = document.getElementById('extras-grid');

        // Limpa qualquer conteúdo estático que possa ter sobrado
        limpezasGrid.innerHTML = '';
        limpezasOutrosGrid.innerHTML = '';
        restauracoesGrid.innerHTML = '';
        extrasGrid.innerHTML = '';

        // Itera sobre cada serviço recebido da API
        data.items.forEach(item => {
            const { nomeDoServico, preco, observacaoDoPreco, categoria, icone } = item.fields;
            
            // Pega a URL do ícone
            const urlIcone = icone ? `https:${assets.get(icone.sys.id).file.url}` : 'img/placeholder.png';

            // Formata a observação de preço (ex: "(a partir de)")
            const precoObservacaoHTML = observacaoDoPreco ? `<small>${observacaoDoPreco}</small>` : '';

            // Cria o HTML para o item de serviço
            const itemHTML = `
                <div class="price-item">
                    <div class="service-name">
                        <img src="${urlIcone}" alt="Ícone de ${nomeDoServico}" class="price-icon">
                        <span>${nomeDoServico.toUpperCase()}</span>
                    </div>
                    <div class="service-price">${precoObservacaoHTML} R$ ${preco}</div>
                </div>
            `;
            
            // Insere o HTML no grid da categoria correta
            switch (categoria) {
                case 'Limpezas':
                    if (nomeDoServico.includes('Boné') || nomeDoServico.includes('Slides')) {
                        limpezasOutrosGrid.innerHTML += itemHTML;
                    } else {
                        limpezasGrid.innerHTML += itemHTML;
                    }
                    break;
                case 'Restaurações':
                    restauracoesGrid.innerHTML += itemHTML;
                    break;
                case 'Serviços Extras':
                    extrasGrid.innerHTML += itemHTML;
                    break;
            }
        });

    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        // Você pode adicionar uma mensagem de erro no site aqui se quiser
    }
}


// ##################################################################
// # FUNÇÃO PARA BUSCAR E RENDERIZAR OS RESULTADOS NA GALERIA
// ##################################################################
async function carregarResultados() {
    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=resultadoDaGaleria`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Falha ao carregar os resultados da galeria.');

        const data = await response.json();
        const assets = new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields]));
        const sliderContainer = document.getElementById('gallery-slider');
        sliderContainer.innerHTML = ''; // Limpa o container

        // Itera sobre cada resultado e cria as imagens
        data.items.forEach(item => {
            const { fotoAntes, fotoDepois } = item.fields;
            if (fotoAntes && fotoDepois) {
                const urlFotoAntes = `https:${assets.get(fotoAntes.sys.id).file.url}`;
                const urlFotoDepois = `https:${assets.get(fotoDepois.sys.id).file.url}`;
                
                sliderContainer.innerHTML += `<img src="${urlFotoAntes}" alt="Antes" class="slide">`;
                sliderContainer.innerHTML += `<img src="${urlFotoDepois}" alt="Depois" class="slide">`;
            }
        });

        // Após carregar as imagens, inicializa a lógica do slider
        inicializarSlider();

    } catch (error) {
        console.error('Erro ao buscar resultados:', error);
    }
}


// ##################################################################
// # LÓGICA DO SLIDER (AGORA EM UMA FUNÇÃO DE INICIALIZAÇÃO)
// ##################################################################
function inicializarSlider() {
    slides = document.querySelectorAll('#gallery-slider .slide');
    if (slides.length > 0) {
        currentSlide = 0;
        showSlide(currentSlide);
    }
}

function showSlide(index) {
    if (slides.length === 0) return;
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
}

function nextSlide() {
    if (slides.length === 0) return;
    currentSlide++;
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    showSlide(currentSlide);
}

function prevSlide() {
    if (slides.length === 0) return;
    currentSlide--;
    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    showSlide(currentSlide);
}