// ============================
// MENU HAMBURGUER
// ============================
var menuToggle = document.getElementById('menuToggle');
var navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    navLinks.classList.toggle('aberto');
    menuToggle.textContent = navLinks.classList.contains('aberto') ? '✕' : '☰';
  });

  // Fechar ao clicar num link
  navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      navLinks.classList.remove('aberto');
      menuToggle.textContent = '☰';
    });
  });

  // Fechar ao clicar fora
  document.addEventListener('click', function(e) {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
      navLinks.classList.remove('aberto');
      menuToggle.textContent = '☰';
    }
  });
}

// ============================
// MINIATURAS DA PÁGINA DE PRODUTO
// ============================
var miniaturas = document.querySelectorAll('.miniatura');
var fotoPrincipal = document.getElementById('fotoPrincipal');

if (miniaturas.length && fotoPrincipal) {
  miniaturas.forEach(function(mini) {
    mini.addEventListener('click', function() {
      fotoPrincipal.src = this.src;
      fotoPrincipal.alt = this.alt;
      miniaturas.forEach(function(m) { m.classList.remove('ativa'); });
      this.classList.add('ativa');
    });
  });
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
    style: 'currency', currency: 'BRL'
  });
}

// ============================
// WHATSAPP
// ============================
function whatsapp(produto) {
  var msg = 'Olá Allysson! Vi o site e tenho interesse em: ' + produto + '. Pode me passar um orçamento?';
  window.open('https://wa.me/5583988800352?text=' + encodeURIComponent(msg), '_blank');
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
}, { threshold: 0.08 });

document.querySelectorAll('.galeria-card, .etapa, .categoria-card, .sugestao-box').forEach(function(el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ============================
// LIGHTBOX
// ============================
(function() {
  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = '<button class="lightbox-fechar">&times;</button><img alt="" />';
  document.body.appendChild(overlay);

  var imgLightbox = overlay.querySelector('img');
  var btnFechar = overlay.querySelector('.lightbox-fechar');

  function abrirLightbox(src, alt) {
    imgLightbox.src = src;
    imgLightbox.alt = alt || '';
    overlay.classList.add('aberto');
    document.body.style.overflow = 'hidden';
  }

  function fecharLightbox() {
    overlay.classList.remove('aberto');
    document.body.style.overflow = '';
  }

  btnFechar.addEventListener('click', fecharLightbox);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) fecharLightbox();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') fecharLightbox();
  });

  document.addEventListener('click', function(e) {
    var img = e.target.closest('.galeria-card img, .produto-foto-principal, .hero-foto, .categoria-card img, .contato-foto, .admin-card-img');
    if (img) {
      abrirLightbox(img.src, img.alt);
    }
  });
})();

// ============================
// GALERIA DINÂMICA (via API)
// ============================
(function() {
  var container = document.getElementById('galeriaDinamica');
  if (!container) {
    container = document.querySelector('.galeria-grid[data-categoria]');
  }
  if (!container) return;

  var categoria = container.dataset.categoria;

  fetch('/api/produtos')
    .then(function(r) { return r.json(); })
    .then(function(dados) {
      var produtos = (dados.categorias && dados.categorias[categoria]) || [];
      if (produtos.length === 0) {
        container.innerHTML = '<div class="admin-card-empty">Nenhum produto encontrado nesta categoria.</div>';
        return;
      }

      var html = '';
      produtos.forEach(function(p) {
        var src = p.imagem || '';
        var nome = p.nome || '';
        var alt = p.alt || nome;
        var msg = nome.replace(/'/g, "\\'");
        html += '<div class="galeria-card">';
        html += '<img src="' + src + '" alt="' + alt + '" onerror="this.style.display=\'none\'" />';
        html += '<div class="galeria-info">';
        html += '<span class="galeria-nome">' + nome + '</span>';
        html += '<button class="btn-orcamento" onclick="whatsapp(\'' + msg + '\')">Orçar ↗</button>';
        html += '</div></div>';
      });
      container.innerHTML = html;

      // Re-aplica IntersectionObserver para os novos cards
      document.querySelectorAll('.galeria-card').forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
      });
    })
    .catch(function() {
      // Fallback silencioso — se o servidor não estiver rodando
    });
})();