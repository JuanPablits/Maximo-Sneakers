// Seleciona todas as imagens do slider
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showSlide(index) {
    // Esconde todos os slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    // Mostra o slide correto
    slides[index].classList.add('active');
}

function nextSlide() {
    currentSlide++;
    if (currentSlide >= slides.length) {
        currentSlide = 0; // Volta para o primeiro slide se chegar ao final
    }
    showSlide(currentSlide);
}

// Função para voltar o slide
function prevSlide() {
    currentSlide--;
    if (currentSlide < 0) {
        currentSlide = slides.length - 1; // Vai para o último slide se voltar do primeiro
    }
    showSlide(currentSlide);
}

// Mostra o primeiro slide ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    showSlide(currentSlide);
});