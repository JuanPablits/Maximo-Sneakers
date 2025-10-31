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
let ideiasSlides = [];
let currentIdeiaSlide = 0;
let feedbackSlides = [];
let currentFeedbackSlide = 0;

// ##################################################################
// # FUNÇÃO PRINCIPAL
// ##################################################################
document.addEventListener('DOMContentLoaded', () => {
    carregarServicos();
    carregarResultados();
    carregarIdeiasCustomizacao();
    carregarCustomizacoesRealizadas();
    carregarFeedbacks();
});


// ##################################################################
// # FUNÇÃO PARA CARREGAR SERVIÇOS
// ##################################################################
async function carregarServicos() {
    if (!spaceId || !accessToken || spaceId === 'SEU_SPACE_ID_AQUI' || accessToken === 'SEU_ACCESS_TOKEN_AQUI') {
        const servicosContainer = document.getElementById('servicos');
        if (servicosContainer) {
            servicosContainer.innerHTML = `<div style="text-align: center; padding: 50px; background-color: #333; color: #ff6347; border-radius: 8px; margin: 20px auto; max-width: 600px;"><h2>Erro de Configuração</h2><p>Por favor, insira suas chaves <code>spaceId</code> e <code>accessToken</code> do Contentful no arquivo <code>script.js</code>.</p></div>`;
        }
        return;
    }

    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=servico`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok || !data.items) { throw new Error('Falha ao carregar os serviços.'); }
        
        const assets = data.includes?.Asset ? new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields])) : new Map();

        const categorias = {
            limpezas: [],
            restauracoes: [],
            customizacoes: [],
            extras: [],
            combos: []
        };
        
        data.items.forEach(item => {
            switch (item.fields.categoria) {
                case 'Limpezas': categorias.limpezas.push(item); break;
                case 'Restaurações e Pinturas': categorias.restauracoes.push(item); break;
                case 'Customizações': categorias.customizacoes.push(item); break;
                case 'Serviços Extras': categorias.extras.push(item); break;
                case 'Combos': categorias.combos.push(item); break;
            }
        });

        const sortByOrder = (a, b) => (a.fields.ordemDeExibicao || 99) - (b.fields.ordemDeExibicao || 99);
        Object.values(categorias).forEach(cat => cat.sort(sortByOrder));

        // FUNÇÃO PARA RENDERIZAR CARDS EM LISTA (TÊNIS, COMBOS, EXTRAS)
        const renderizarCardList = (servicos, container) => {
            if (!container) return;
            container.innerHTML = '';
            servicos.forEach(item => {
                const { nomeDoServico, subtitulo, descricaoLonga, preco, observacaoDoPreco, icone, precoAntigo } = item.fields;
                const urlIcone = icone ? `https:${assets.get(icone.sys.id)?.file?.url}` : 'img/placeholder.png';
                const subtituloHTML = subtitulo ? `<span class="price-list-subtitle">(${subtitulo.toUpperCase()})</span>` : '';
                const descricaoHTML = descricaoLonga ? `<p class="price-list-description">${descricaoLonga}</p>` : '';
                
                let precoHTML = '';
                if (precoAntigo) {
                    precoHTML = `<div class="price-combo"><span class="old-price">R$ ${precoAntigo}</span> <span class="new-price">R$ ${preco}</span></div>`;
                } else {
                    const precoObservacaoHTML = observacaoDoPreco ? `<small>${observacaoDoPreco}</small>` : '';
                    precoHTML = `${precoObservacaoHTML} R$${preco}`;
                }
                
                const itemHTML = `
                    <div class="price-item">
                        <div class="service-name">
                            <img src="${urlIcone}" alt="Ícone de ${nomeDoServico}" class="price-icon">
                            <div class="service-details">
                                <span>${nomeDoServico.toUpperCase()} ${subtituloHTML}</span>
                                ${descricaoHTML}
                            </div>
                        </div>
                        <div class="price-list-price">${precoHTML}</div>
                    </div>
                `;
                container.innerHTML += itemHTML;
            });
        };

        // FUNÇÃO PARA RENDERIZAR CARDS EM GRADE (OUTROS ITENS)
        const renderizarGrid = (servicos, container) => {
            if (!container) return;
            container.innerHTML = '';
            servicos.forEach(item => {
                const { nomeDoServico, preco, observacaoDoPreco, icone, descricaoLonga, subtitulo, precoAntigo } = item.fields;
                const urlIcone = icone ? `https:${assets.get(icone.sys.id)?.file?.url}` : 'img/placeholder.png';
                const subtituloHTML = subtitulo ? `<span class="service-subtitle">${subtitulo.toUpperCase()}</span>` : '';
                const descricaoHTML = descricaoLonga ? `<p class="service-description">${descricaoLonga}</p>` : '';

                let precoHTML = '';
                if (precoAntigo) {
                    precoHTML = `<div class="price-combo"><span class="old-price">R$ ${precoAntigo}</span> <span class="new-price">R$ ${preco}</span></div>`;
                } else {
                    const precoObservacaoHTML = observacaoDoPreco ? `<small>${observacaoDoPreco}</small>` : '';
                    precoHTML = `${precoObservacaoHTML} R$ ${preco}`;
                }

                const itemHTML = `
                    <div class="price-item">
                        <div class="service-name">
                            <img src="${urlIcone}" alt="Ícone de ${nomeDoServico}" class="price-icon">
                            <div class="service-details">
                                <span>${nomeDoServico.toUpperCase()} ${subtituloHTML}</span>
                            </div>
                        </div>
                        ${descricaoHTML}
                        <div class="service-price">${precoHTML}</div>
                    </div>
                `;
                container.innerHTML += itemHTML;
            });
        };
        
        const limpezasTenis = categorias.limpezas.filter(s => 
            !s.fields.nomeDoServico.toLowerCase().includes('bolsa') && 
            !s.fields.nomeDoServico.toLowerCase().includes('boné') && 
            !s.fields.nomeDoServico.toLowerCase().includes('slides')
        );
        const limpezasOutros = categorias.limpezas.filter(s => 
            s.fields.nomeDoServico.toLowerCase().includes('bolsa') || 
            s.fields.nomeDoServico.toLowerCase().includes('boné') || 
            s.fields.nomeDoServico.toLowerCase().includes('slides')
        );

        renderizarCardList(limpezasTenis, document.getElementById('limpezas-tenis-list'));
        renderizarGrid(limpezasOutros, document.getElementById('limpezas-outros-grid'));
        renderizarCardList(categorias.combos, document.getElementById('combos-grid'));
        renderizarGrid(categorias.restauracoes, document.getElementById('restauracoes-grid'));
        renderizarGrid(categorias.customizacoes, document.getElementById('customizacoes-grid'));
        renderizarCardList(categorias.extras, document.getElementById('extras-grid'));

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
        if (!response.ok || !data.items || data.items.length === 0) {
            document.getElementById('transformacao').style.display = 'none';
            return;
        }
        const assets = data.includes?.Asset ? new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields])) : new Map();
        const sliderContainer = document.getElementById('gallery-slider');
        if (!sliderContainer) return;
        sliderContainer.innerHTML = '';
        data.items.forEach(item => {
            const { fotoAntes, fotoDepois } = item.fields;
            if (fotoAntes && fotoDepois) {
                const urlFotoAntes = `https:${assets.get(fotoAntes.sys.id)?.file?.url}`;
                const urlFotoDepois = `https:${assets.get(fotoDepois.sys.id)?.file?.url}`;
                sliderContainer.innerHTML += `<img src="${urlFotoAntes}" alt="Antes" class="slide"><img src="${urlFotoDepois}" alt="Depois" class="slide">`;
            }
        });
        inicializarSlider();
    } catch (error) {
        console.error('ERRO EM carregarResultados:', error);
    }
}

// ##################################################################
// # FUNÇÃO PARA CARREGAR IDEIAS DE CUSTOMIZAÇÃO
// ##################################################################
async function carregarIdeiasCustomizacao() {
    if (!spaceId || !accessToken || spaceId === 'SEU_SPACE_ID_AQUI' || accessToken === 'SEU_ACCESS_TOKEN_AQUI') { return; }
    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=ideiaDeCustomizacao`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok || !data.items || data.items.length === 0) {
            document.getElementById('ideias-customizacao').style.display = 'none';
            return;
        }
        const assets = data.includes?.Asset ? new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields])) : new Map();
        const sliderContainer = document.getElementById('ideias-slider');
        if (!sliderContainer) return;
        sliderContainer.innerHTML = '';
        data.items.forEach(item => {
            const { imagemDaIdeia } = item.fields;
            if (imagemDaIdeia) {
                const urlImagem = `https:${assets.get(imagemDaIdeia.sys.id)?.file?.url}`;
                sliderContainer.innerHTML += `<img src="${urlImagem}" alt="Ideia de Customização" class="slide">`;
            }
        });
        inicializarIdeiaSlider();
    } catch (error) {
        console.error('ERRO EM carregarIdeiasCustomizacao:', error);
    }
}

// ##################################################################
// # FUNÇÃO PARA CARREGAR CUSTOMIZAÇÕES REALIZADAS
// ##################################################################
async function carregarCustomizacoesRealizadas() {
    if (!spaceId || !accessToken || spaceId === 'SEU_SPACE_ID_AQUI' || accessToken === 'SEU_ACCESS_TOKEN_AQUI') { return; }
    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=customizacaoRealizada`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok || !data.items || data.items.length === 0) {
            document.getElementById('customizacoes-realizadas').style.display = 'none';
            return;
        }
        const assets = data.includes?.Asset ? new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields])) : new Map();
        const sliderContainer = document.getElementById('customizacoes-slider');
        if (!sliderContainer) return;
        sliderContainer.innerHTML = '';
        data.items.forEach(item => {
            const { fotoDaCustomizacao } = item.fields; 
            if (fotoDaCustomizacao) {
                const urlImagem = `https:${assets.get(fotoDaCustomizacao.sys.id)?.file?.url}`;
                sliderContainer.innerHTML += `<img src="${urlImagem}" alt="Customização Realizada" class="slide">`;
            }
        });
        inicializarCustomizacaoSlider();
    } catch (error) {
        console.error('ERRO EM carregarCustomizacoesRealizadas:', error);
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
            document.getElementById('feedbacks').style.display = 'none';
            return;
        }
        const assets = data.includes?.Asset ? new Map(data.includes.Asset.map(asset => [asset.sys.id, asset.fields])) : new Map();
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
    if (slides.length > 0) { currentSlide = 0; showSlide(currentSlide); }
}
function showSlide(index) {
    if (slides.length === 0) return;
    slides.forEach((slide, i) => { slide.classList.toggle('active', i === index); });
}
function nextSlide() {
    if (slides.length === 0) return;
    currentSlide++;
    if (currentSlide >= slides.length) { currentSlide = 0; }
    showSlide(currentSlide);
}
function prevSlide() {
    if (slides.length === 0) return;
    currentSlide--;
    if (currentSlide < 0) { currentSlide = slides.length - 1; }
    showSlide(currentSlide);
}

// ##################################################################
// # LÓGICA DO SLIDER DE CUSTOMIZAÇÕES REALIZADAS
// ##################################################################
function inicializarCustomizacaoSlider() {
    customizacaoSlides = document.querySelectorAll('#customizacoes-slider .slide');
    if (customizacaoSlides.length > 0) { currentCustomizacaoSlide = 0; showCustomizacaoSlide(currentCustomizacaoSlide); }
}
function showCustomizacaoSlide(index) {
    if (customizacaoSlides.length === 0) return;
    customizacaoSlides.forEach((slide, i) => { slide.classList.toggle('active', i === index); });
}
function nextCustomizacaoSlide() {
    if (customizacaoSlides.length === 0) return;
    currentCustomizacaoSlide++;
    if (currentCustomizacaoSlide >= customizacaoSlides.length) { currentCustomizacaoSlide = 0; }
    showCustomizacaoSlide(currentCustomizacaoSlide);
}
function prevCustomizacaoSlide() {
    if (customizacaoSlides.length === 0) return;
    currentCustomizacaoSlide--;
    if (currentCustomizacaoSlide < 0) { currentCustomizacaoSlide = customizacaoSlides.length - 1; }
    showCustomizacaoSlide(currentCustomizacaoSlide);
}

// ##################################################################
// # LÓGICA DO SLIDER DE IDEIAS DE CUSTOMIZAÇÃO
// ##################################################################
function inicializarIdeiaSlider() {
    ideiasSlides = document.querySelectorAll('#ideias-slider .slide');
    if (ideiasSlides.length > 0) { currentIdeiaSlide = 0; showIdeiaSlide(currentIdeiaSlide); }
}
function showIdeiaSlide(index) {
    if (ideiasSlides.length === 0) return;
    ideiasSlides.forEach((slide, i) => { slide.classList.toggle('active', i === index); });
}
function nextIdeiaSlide() {
    if (ideiasSlides.length === 0) return;
    currentIdeiaSlide++;
    if (currentIdeiaSlide >= ideiasSlides.length) { currentIdeiaSlide = 0; }
    showIdeiaSlide(currentIdeiaSlide);
}
function prevIdeiaSlide() {
    if (ideiasSlides.length === 0) return;
    currentIdeiaSlide--;
    if (currentIdeiaSlide < 0) { 
        currentIdeiaSlide = ideiasSlides.length - 1; 
    }
    showIdeiaSlide(currentIdeiaSlide);
}


// ##################################################################
// # LÓGICA DO SLIDER DE FEEDBACKS
// ##################################################################
function inicializarFeedbackSlider() {
    feedbackSlides = document.querySelectorAll('#feedbacks-slider .slide');
    if (feedbackSlides.length > 0) { currentFeedbackSlide = 0; showFeedbackSlide(currentFeedbackSlide); }
}
function showFeedbackSlide(index) {
    if (feedbackSlides.length === 0) return;
    feedbackSlides.forEach((slide, i) => { slide.classList.toggle('active', i === index); });
}
function nextFeedbackSlide() {
    if (feedbackSlides.length === 0) return;
    currentFeedbackSlide++;
    if (currentFeedbackSlide >= feedbackSlides.length) { currentFeedbackSlide = 0; }
    showFeedbackSlide(currentFeedbackSlide);
}
function prevFeedbackSlide() {
    if (feedbackSlides.length === 0) return;
    currentFeedbackSlide--;
    if (currentFeedbackSlide < 0) { currentFeedbackSlide = feedbackSlides.length - 1; }
    showFeedbackSlide(currentFeedbackSlide);
}