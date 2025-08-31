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
    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=servico`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.items) {
            console.error("Resposta da API de Serviços com erro:", data);
            throw new Error('Falha ao carregar os serviços ou dados inválidos.');
        }
        
        const assets = data.includes && data.includes.Asset ? new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields])) : new Map();

        // --- NOVA LÓGICA DE ORGANIZAÇÃO ---

        // 1. SEPARA OS SERVIÇOS EM ARRAYS POR CATEGORIA
        const categorias = {
            limpezas: [],
            restauracoes: [],
            customizacoes: [],
            extras: []
        };

        data.items.forEach(item => {
            switch (item.fields.categoria) {
                case 'Limpezas':
                    categorias.limpezas.push(item);
                    break;
                case 'Restaurações e Pinturas':
                    categorias.restauracoes.push(item);
                    break;
                case 'Customizações':
                    categorias.customizacoes.push(item);
                    break;
                case 'Serviços Extras':
                    categorias.extras.push(item);
                    break;
            }
        });

        // 2. ORDENA CADA CATEGORIA INDIVIDUALMENTE
        
        // Ordena Limpezas por prioridade de nome
        categorias.limpezas.sort((a, b) => {
            const nameA = a.fields.nomeDoServico.toLowerCase();
            const nameB = b.fields.nomeDoServico.toLowerCase();
            const priority = (name) => {
                if (name.startsWith('limpeza 1')) return 1;
                if (name.startsWith('limpeza 2')) return 2;
                if (name.startsWith('limpeza 3')) return 3;
                if (name.startsWith('limpeza exclusive')) return 4;
                return 5;
            };
            return priority(nameA) - priority(nameB) || a.fields.preco - b.fields.preco;
        });

        // Ordena Restaurações pelo campo "Ordem de Exibição"
        categorias.restauracoes.sort((a, b) => (a.fields.ordemDeExibicao || 99) - (b.fields.ordemDeExibicao || 99));

        // Ordena Customizações e Extras por preço
        categorias.customizacoes.sort((a, b) => a.fields.preco - b.fields.preco);
        categorias.extras.sort((a, b) => a.fields.preco - b.fields.preco);


        // 3. RENDERIZA CADA CATEGORIA NO SEU DEVIDO LUGAR
        const renderizarServicos = (servicos, container) => {
            container.innerHTML = ''; // Limpa o container primeiro
            servicos.forEach(item => {
                const { nomeDoServico, preco, observacaoDoPreco, icone } = item.fields;
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
                container.innerHTML += itemHTML;
            });
        };

        const limpezasGrid = document.getElementById('limpezas-grid');
        const limpezasOutrosGrid = document.getElementById('limpezas-outros-grid');
        
        // Separa as limpezas de tênis das outras
        const limpezasTenis = categorias.limpezas.filter(s => !s.fields.nomeDoServico.toLowerCase().includes('boné') && !s.fields.nomeDoServico.toLowerCase().includes('slides'));
        const limpezasOutros = categorias.limpezas.filter(s => s.fields.nomeDoServico.toLowerCase().includes('boné') || s.fields.nomeDoServico.toLowerCase().includes('slides'));
        
        renderizarServicos(limpezasTenis, limpezasGrid);
        renderizarServicos(limpezasOutros, limpezasOutrosGrid);
        renderizarServicos(categorias.restauracoes, document.getElementById('restauracoes-grid'));
        renderizarServicos(categorias.customizacoes, document.getElementById('customizacoes-grid'));
        renderizarServicos(categorias.extras, document.getElementById('extras-grid'));

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