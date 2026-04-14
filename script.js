// ============================
// WHATSAPP — ORÇAMENTO RÁPIDO
// ============================

function whatsapp(produto) {
  var msg = 'Olá Allysson! Vi o site e tenho interesse em: ' + produto + '. Pode me passar um orçamento?';
  var url = 'https://wa.me/5583988800352?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
}

// ============================
// CALCULADORA DE OURO
// ============================

var PRECO_OURO_24K = 387.50;

function calcularOuro() {
  var peso = parseFloat(document.getElementById('peso').value) || 0;
  var fator = parseFloat(document.getElementById('quilate').value) || 1;
  var valor = peso * fator * PRECO_OURO_24K;

  document.getElementById('resultado').textContent = valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// ============================
// SCROLL SUAVE
// ============================

document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    var destino = document.querySelector(this.getAttribute('href'));
    if (destino) {
      e.preventDefault();
      destino.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ============================
// ANIMAÇÃO AO ROLAR
// ============================

var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.galeria-card, .etapa').forEach(function(el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});