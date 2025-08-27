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
    // CORREÇÃO APLICADA AQUI: o parâmetro 'order' foi corrigido.
    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=servico&order=fields.preco`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.items) {
            console.error("Resposta da API de Serviços com erro:", data);
            throw new Error('Falha ao carregar os serviços ou dados inválidos.');
        }
        
        const assets = data.includes && data.includes.Asset ? new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields])) : new Map();

        const limpezasGrid = document.getElementById('limpezas-grid');
        const limpezasOutrosGrid = document.getElementById('limpezas-outros-grid');
        const restauracoesGrid = document.getElementById('restauracoes-grid');
        const extrasGrid = document.getElementById('extras-grid');

        limpezasGrid.innerHTML = '';
        limpezasOutrosGrid.innerHTML = '';
        restauracoesGrid.innerHTML = '';
        extrasGrid.innerHTML = '';

        data.items.forEach(item => {
            const { nomeDoServico, preco, observacaoDoPreco, categoria, icone } = item.fields;
            const urlIcone = icone ? `https:${assets.get(icone.sys.id)?.file?.url}` : 'img/placeholder.png';
            const precoObservacaoHTML = observacaoDoPreco ? `<small>${observacaoDoPreco}</small>` : '';

            const itemHTML = `
                <div class="price-item">
                    <div class="service-name">
                        <img src="${urlIcone}" alt="Ícone de ${nomeDoServico}" class="price-icon">
                        <span>${nomeDoServico.toUpperCase()}</span>
                    </div>
                    <div class="service-price">${precoObservacaoHTML} R$ ${preco}</div>
                </div>
            `;
            
            switch (categoria) {
                case 'Limpezas':
                    if (nomeDoServico.toLowerCase().includes('boné') || nomeDoServico.toLowerCase().includes('slides')) {
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
        console.error('ERRO EM carregarServicos:', error);
    }
}

// ##################################################################
// # FUNÇÃO PARA BUSCAR E RENDERIZAR OS RESULTADOS NA GALERIA
// ##################################################################
async function carregarResultados() {
    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=resultadoDaGaleria`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok || !data.items) {
            console.error("Resposta da API de Resultados com erro:", data);
            throw new Error('Falha ao carregar os resultados da galeria ou dados inválidos.');
        }

        const assets = data.includes && data.includes.Asset ? new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields])) : new Map();
        const sliderContainer = document.getElementById('gallery-slider');
        sliderContainer.innerHTML = '';

        data.items.forEach(item => {
            const { fotoAntes, fotoDepois } = item.fields;
            if (fotoAntes && fotoDepois) {
                const urlFotoAntes = `https:${assets.get(fotoAntes.sys.id)?.file?.url}`;
                const urlFotoDepois = `https:${assets.get(fotoDepois.sys.id)?.file?.url}`;
                
                sliderContainer.innerHTML += `<img src="${urlFotoAntes}" alt="Antes" class="slide">`;
                sliderContainer.innerHTML += `<img src="${urlFotoDepois}" alt="Depois" class="slide">`;
            }
        });

        inicializarSlider();

    } catch (error) {
        console.error('ERRO EM carregarResultados:', error);
    }
}

// ##################################################################
// # LÓGICA DO SLIDER
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