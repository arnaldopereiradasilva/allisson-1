var SENHA = 'admin123';
var categoriaAtiva = null;
var produtos = {};

function mostrar(tela) {
  document.getElementById('telaLogin').style.display = tela === 'login' ? '' : 'none';
  document.getElementById('telaAdmin').style.display = tela === 'admin' ? '' : 'none';
}

document.getElementById('btnEntrar').addEventListener('click', function() {
  var senha = document.getElementById('inputSenha').value;
  if (senha === SENHA) {
    mostrar('admin');
    carregarDados();
  } else {
    document.getElementById('loginErro').textContent = 'Senha incorreta!';
  }
});

document.getElementById('inputSenha').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') document.getElementById('btnEntrar').click();
});

document.getElementById('btnLogout').addEventListener('click', function() {
  mostrar('login');
  document.getElementById('inputSenha').value = '';
  document.getElementById('loginErro').textContent = '';
});

function carregarDados() {
  fetch('/api/produtos')
    .then(function(r) { return r.json(); })
    .then(function(dados) {
      produtos = dados.categorias || {};
      var cats = Object.keys(produtos);
      if (cats.length === 0) {
        document.getElementById('gradeProdutos').innerHTML = '<div class="admin-card-empty">Nenhuma categoria encontrada</div>';
        document.getElementById('tabsCategorias').innerHTML = '';
        return;
      }
      renderizarTabs(cats);
      if (!categoriaAtiva || !produtos[categoriaAtiva]) categoriaAtiva = cats[0];
      renderizarGrade(categoriaAtiva);
    });
}

function renderizarTabs(cats) {
  var html = '';
  var nomes = { aliancas: 'Alianças', aneis: 'Anéis', cordoes: 'Cordões', pingentes: 'Pingentes', personalizados: 'Personalizados' };
  cats.forEach(function(c) {
    html += '<button class="admin-tab' + (c === categoriaAtiva ? ' active' : '') + '" data-cat="' + c + '">' + (nomes[c] || c) + '</button>';
  });
  document.getElementById('tabsCategorias').innerHTML = html;

  document.querySelectorAll('.admin-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      categoriaAtiva = this.dataset.cat;
      renderizarTabs(Object.keys(produtos));
      renderizarGrade(categoriaAtiva);
    });
  });
}

function renderizarGrade(cat) {
  var container = document.getElementById('gradeProdutos');
  var itens = produtos[cat] || [];

  if (itens.length === 0) {
    container.innerHTML = '<div class="admin-card-empty">Nenhum produto nesta categoria. Clique em "+ Novo produto" para adicionar.</div>';
    return;
  }

  var html = '';
  itens.forEach(function(p) {
    var src = p.imagem || '';
    html += '<div class="admin-card">';
    html += '<img class="admin-card-img" src="' + src + '" alt="' + p.alt + '" onerror="this.src=\'\';this.style.background=\'#f0f0f0\'" />';
    html += '<div class="admin-card-body">';
    html += '<span class="admin-card-nome">' + p.nome + '</span>';
    html += '<div class="admin-card-actions">';
    html += '<button class="btn-card btn-card-edit" data-id="' + p.id + '" data-cat="' + cat + '">Editar</button>';
    html += '<button class="btn-card btn-card-delete" data-id="' + p.id + '" data-cat="' + cat + '">Excluir</button>';
    html += '</div></div></div>';
  });

  container.innerHTML = html;

  container.querySelectorAll('.btn-card-edit').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.dataset.id;
      var cat = this.dataset.cat;
      var produto = produtos[cat].find(function(p) { return p.id === id; });
      if (produto) abrirModal(produto, cat);
    });
  });

  container.querySelectorAll('.btn-card-delete').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = this.dataset.id;
      var cat = this.dataset.cat;
      if (confirm('Tem certeza que deseja excluir este produto?')) {
        excluirProduto(id, cat);
      }
    });
  });
}

function abrirModal(produto, cat) {
  document.getElementById('modalTitulo').textContent = produto ? 'Editar produto' : 'Novo produto';
  document.getElementById('editId').value = produto ? produto.id : '';
  document.getElementById('editCategoria').value = cat || categoriaAtiva;
  document.getElementById('inputNome').value = produto ? produto.nome : '';
  document.getElementById('inputAlt').value = produto ? produto.alt : '';

  var preview = document.getElementById('uploadPreview');
  var placeholder = document.getElementById('uploadPlaceholder');
  if (produto && produto.imagem) {
    preview.src = produto.imagem;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    preview.style.display = 'none';
    placeholder.style.display = 'block';
  }

  document.getElementById('modalOverlay').style.display = '';
}

function fecharModal() {
  document.getElementById('modalOverlay').style.display = 'none';
  document.getElementById('formProduto').reset();
  document.getElementById('editId').value = '';
  document.getElementById('uploadPreview').style.display = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'block';
}

document.getElementById('modalFechar').addEventListener('click', fecharModal);
document.getElementById('modalCancelar').addEventListener('click', fecharModal);
document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) fecharModal();
});

document.getElementById('btnAddProduto').addEventListener('click', function() {
  abrirModal(null, categoriaAtiva);
});

// Upload preview
document.getElementById('inputImagem').addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    document.getElementById('uploadPreview').src = ev.target.result;
    document.getElementById('uploadPreview').style.display = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
});

document.getElementById('formProduto').addEventListener('submit', function(e) {
  e.preventDefault();

  var id = document.getElementById('editId').value;
  var cat = document.getElementById('editCategoria').value;
  var nome = document.getElementById('inputNome').value.trim();
  var alt = document.getElementById('inputAlt').value.trim() || nome;
  var fileInput = document.getElementById('inputImagem');
  var file = fileInput.files[0];

  if (!nome) return alert('Nome é obrigatório');

  function salvar(caminhoImagem) {
    var payload = { categoria: cat, nome: nome, alt: alt };
    if (caminhoImagem) payload.imagem = caminhoImagem;

    var url = id ? '/api/produtos/' + id : '/api/produtos';
    var method = id ? 'PUT' : 'POST';

    fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function(r) { return r.json(); })
      .then(function() {
        fecharModal();
        carregarDados();
      });
  }

  if (file) {
    var formData = new FormData();
    formData.append('imagem', file);
    fetch('/api/upload', { method: 'POST', body: formData })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.ok) salvar(data.caminho);
        else alert('Erro ao enviar imagem');
      });
  } else {
    salvar(null);
  }
});

function excluirProduto(id, cat) {
  fetch('/api/produtos/' + id, { method: 'DELETE' })
    .then(function(r) { return r.json(); })
    .then(function() {
      carregarDados();
    });
}
