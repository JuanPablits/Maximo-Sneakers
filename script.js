// ##################################################################
// # CONFIGURAÇÃO DA API DO CONTENTFUL
// ##################################################################
const spaceId = 'pusavj4b0ybx';
const accessToken = 'knsoFyXohlck3hu9veCzUctMXWK74f4sVnNsLZEz1EI';

// Variáveis globais para os sliders
let slides = [];
let currentSlide = 0;
let customizacaoSlides = [];
let currentCustomizacaoSlide = 0;
let feedbackSlides = [];
let currentFeedbackSlide = 0;

// ##################################################################
// # FUNÇÃO PRINCIPAL
// ##################################################################
document.addEventListener('DOMContentLoaded', () => {
    carregarServicos();
    carregarResultados();
    carregarCustomizacoes();
    carregarFeedbacks();
});

// ##################################################################
// # FUNÇÃO PARA CARREGAR SERVIÇOS
// ##################################################################
async function carregarServicos() {
    if (!spaceId || !accessToken || spaceId === 'SEU_SPACE_ID_AQUI' || accessToken === 'SEU_ACCESS_TOKEN_AQUI') {
        const servicosContainer = document.getElementById('servicos');
        if (servicosContainer) {
            servicosContainer.innerHTML = `
            <div style="text-align: center; padding: 50px; background-color: #333; color: #ff6347; border-radius: 8px; margin: 20px auto; max-width: 600px;">
                <h2>Erro de Configuração</h2>
                <p>Por favor, insira suas chaves <code>spaceId</code> e <code>accessToken</code> do Contentful no arquivo <code>script.js</code>.</p>
                <p>Sem essas chaves, não é possível carregar os serviços e conteúdos dinâmicos.</p>
            </div>
        `;
        }
        return;
    }

    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=servico`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.items) {
            console.error("Resposta da API de Serviços com erro:", data);
            throw new Error('Falha ao carregar os serviços ou dados inválidos.');
        }
        
        const assets = data.includes && data.includes.Asset ? new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields])) : new Map();

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

        categorias.restauracoes.sort((a, b) => (a.fields.ordemDeExibicao || 99) - (b.fields.ordemDeExibicao || 99));
        categorias.customizacoes.sort((a, b) => a.fields.preco - b.fields.preco);
        categorias.extras.sort((a, b) => a.fields.preco - b.fields.preco);

        const renderizarServicos = (servicos, container) => {
            if (!container) return;
            container.innerHTML = '';
            servicos.forEach(item => {
                const { nomeDoServico, preco, observacaoDoPreco, icone } = item.fields;
                const urlIcone = icone ? `https:${assets.get(icone.sys.id)?.file?.url}` : 'img/placeholder.png';
                const precoObservacaoHTML = observacaoDoPreco ? `<small>${observacaoDoPreco}</small>` : '';

                let descriptionHTML = '';
                if (nomeDoServico.toLowerCase() === 'limpeza exclusive') {
                    descriptionHTML = `<span class="special-description">Para pares de grife e edições exclusivas.</span>`;
                }
                
                const itemHTML = `
                    <div class="price-item">
                        <div class="service-name">
                            <img src="${urlIcone}" alt="Ícone de ${nomeDoServico}" class="price-icon">
                            <div class="service-details">
                                <span>${nomeDoServico.toUpperCase()}</span>
                                ${descriptionHTML}
                            </div>
                        </div>
                        <div class="service-price">${precoObservacaoHTML} R$ ${preco}</div>
                    </div>
                `;
                
                container.innerHTML += itemHTML;
            });
        };

        const limpezasGrid = document.getElementById('limpezas-grid');
        const limpezasOutrosGrid = document.getElementById('limpezas-outros-grid');
        
        // ##### CORREÇÃO APLICADA AQUI #####
        const limpezasTenis = categorias.limpezas.filter(s => !s.fields.nomeDoServico.toLowerCase().includes('boné') && !s.fields.nomeDoServico.toLowerCase().includes('slides') && !s.fields.nomeDoServico.toLowerCase().includes('bolsas'));
        const limpezasOutros = categorias.limpezas.filter(s => s.fields.nomeDoServico.toLowerCase().includes('boné') || s.fields.nomeDoServico.toLowerCase().includes('slides') || s.fields.nomeDoServico.toLowerCase().includes('bolsas'));
        
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
// # FUNÇÃO PARA CARREGAR RESULTADOS (GALERIA PRINCIPAL)
// ##################################################################
async function carregarResultados() {
    if (!spaceId || !accessToken || spaceId === 'SEU_SPACE_ID_AQUI' || accessToken === 'SEU_ACCESS_TOKEN_AQUI') { return; }

    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=resultadoDaGaleria`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok || !data.items) { return; }

        const assets = data.includes && data.includes.Asset ? new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields])) : new Map();
        const sliderContainer = document.getElementById('gallery-slider');
        if (!sliderContainer) return;
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
// # FUNÇÃO PARA CARREGAR GALERIA DE CUSTOMIZAÇÕES
// ##################################################################
async function carregarCustomizacoes() {
    if (!spaceId || !accessToken || spaceId === 'SEU_SPACE_ID_AQUI' || accessToken === 'SEU_ACCESS_TOKEN_AQUI') { return; }
    
    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=fotoDeCustomizacao`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok || !data.items || data.items.length === 0) {
            const customizacaoGaleria = document.getElementById('customizacao-galeria');
            if (customizacaoGaleria) customizacaoGaleria.style.display = 'none';
            return;
        }

        const assets = data.includes && data.includes.Asset ? new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields])) : new Map();
        const sliderContainer = document.getElementById('customizacao-slider');
        if (!sliderContainer) return;
        sliderContainer.innerHTML = '';

        data.items.forEach(item => {
            const { imagemDaCustomizacao } = item.fields;
            if (imagemDaCustomizacao) {
                const urlImagem = `https:${assets.get(imagemDaCustomizacao.sys.id)?.file?.url}`;
                if (urlImagem) {
                    sliderContainer.innerHTML += `<img src="${urlImagem}" alt="Customização" class="slide">`;
                }
            }
        });

        inicializarCustomizacaoSlider();

    } catch (error) {
        console.error('ERRO EM carregarCustomizacoes:', error);
    }
}

// ##################################################################
// # FUNÇÃO PARA CARREGAR FEEDBACKS
// ##################################################################
async function carregarFeedbacks() {
    if (!spaceId || !accessToken || spaceId === 'SEU_SPACE_ID_AQUI' || accessToken === 'SEU_ACCESS_TOKEN_AQUI') { return; }
    
    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=printDeFeedback`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok || !data.items || data.items.length === 0) {
            const feedbacksSection = document.getElementById('feedbacks');
            if (feedbacksSection) feedbacksSection.style.display = 'none';
            return;
        }

        const assets = data.includes && data.includes.Asset ? new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields])) : new Map();
        const sliderContainer = document.getElementById('feedbacks-slider');
        if (!sliderContainer) return;
        sliderContainer.innerHTML = '';

        data.items.forEach(item => {
            const { imagemDoPrint } = item.fields;
            if (imagemDoPrint) {
                const urlImagem = `https:${assets.get(imagemDoPrint.sys.id)?.file?.url}`;
                sliderContainer.innerHTML += `<img src="${urlImagem}" alt="Feedback de cliente" class="slide">`;
            }
        });

        inicializarFeedbackSlider();

    } catch (error) {
        console.error('ERRO EM carregarFeedbacks:', error);
    }
}


// ##################################################################
// # LÓGICA DO SLIDER PRINCIPAL (RESULTADOS)
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


// ##################################################################
// # LÓGICA DO SLIDER DE CUSTOMIZAÇÕES
// ##################################################################
function inicializarCustomizacaoSlider() {
    customizacaoSlides = document.querySelectorAll('#customizacao-slider .slide');
    if (customizacaoSlides.length > 0) {
        currentCustomizacaoSlide = 0;
        showCustomizacaoSlide(currentCustomizacaoSlide);
    } else {
        const customizacaoGaleria = document.getElementById('customizacao-galeria');
        if (customizacaoGaleria) {
            customizacaoGaleria.style.display = 'none';
        }
    }
}

function showCustomizacaoSlide(index) {
    if (customizacaoSlides.length === 0) return;
    customizacaoSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
}

function nextCustomizacaoSlide() {
    if (customizacaoSlides.length === 0) return;
    currentCustomizacaoSlide++;
    if (currentCustomizacaoSlide >= customizacaoSlides.length) {
        currentCustomizacaoSlide = 0;
    }
    showCustomizacaoSlide(currentCustomizacaoSlide);
}

function prevCustomizacaoSlide() {
    if (customizacaoSlides.length === 0) return;
    currentCustomizacaoSlide--;
    if (currentCustomizacaoSlide < 0) {
        currentCustomizacaoSlide = customizacaoSlides.length - 1;
    }
    showCustomizacaoSlide(currentCustomizacaoSlide);
}

// ##################################################################
// # LÓGICA DO SLIDER DE FEEDBACKS
// ##################################################################
function inicializarFeedbackSlider() {
    feedbackSlides = document.querySelectorAll('#feedbacks-slider .slide');
    if (feedbackSlides.length > 0) {
        currentFeedbackSlide = 0;
        showFeedbackSlide(currentFeedbackSlide);
    } else {
        const feedbacksSection = document.getElementById('feedbacks');
        if (feedbacksSection) {
            feedbacksSection.style.display = 'none';
        }
    }
}

function showFeedbackSlide(index) {
    if (feedbackSlides.length === 0) return;
    feedbackSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
}

function nextFeedbackSlide() {
    if (feedbackSlides.length === 0) return;
    currentFeedbackSlide++;
    if (currentFeedbackSlide >= feedbackSlides.length) {
        currentFeedbackSlide = 0;
    }
    showFeedbackSlide(currentFeedbackSlide);
}

function prevFeedbackSlide() {
    if (feedbackSlides.length === 0) return;
    currentFeedbackSlide--;
    if (currentFeedbackSlide < 0) {
        currentFeedbackSlide = feedbackSlides.length - 1;
    }
    showFeedbackSlide(currentFeedbackSlide);
}