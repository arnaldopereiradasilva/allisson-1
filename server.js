const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DADOS_FILE = path.join(__dirname, 'dados.json');
const IMAGENS_DIR = path.join(__dirname, 'imagens');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGENS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nome = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, nome);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file.originalname).toLowerCase());
    cb(null, ok);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

function lerDados() {
  try { return JSON.parse(fs.readFileSync(DADOS_FILE, 'utf-8')); }
  catch { return { categorias: {} }; }
}

function salvarDados(dados) {
  fs.writeFileSync(DADOS_FILE, JSON.stringify(dados, null, 2), 'utf-8');
}

app.get('/api/produtos', (req, res) => {
  res.json(lerDados());
});

app.post('/api/produtos', (req, res) => {
  const { categoria, nome, alt, imagem } = req.body;
  if (!categoria || !nome) return res.status(400).json({ erro: 'categoria e nome são obrigatórios' });

  const dados = lerDados();
  if (!dados.categorias[categoria]) dados.categorias[categoria] = [];

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  dados.categorias[categoria].push({ id, nome, imagem: imagem || '', alt: alt || nome });
  salvarDados(dados);
  res.json({ ok: true, produto: dados.categorias[categoria].find(p => p.id === id) });
});

app.put('/api/produtos/:id', (req, res) => {
  const dados = lerDados();
  for (const cat of Object.keys(dados.categorias)) {
    const idx = dados.categorias[cat].findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      if (req.body.nome) dados.categorias[cat][idx].nome = req.body.nome;
      if (req.body.alt) dados.categorias[cat][idx].alt = req.body.alt;
      if (req.body.imagem) dados.categorias[cat][idx].imagem = req.body.imagem;
      salvarDados(dados);
      return res.json({ ok: true, produto: dados.categorias[cat][idx] });
    }
  }
  res.status(404).json({ erro: 'produto não encontrado' });
});

app.delete('/api/produtos/:id', (req, res) => {
  const dados = lerDados();
  for (const cat of Object.keys(dados.categorias)) {
    const idx = dados.categorias[cat].findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      const removido = dados.categorias[cat].splice(idx, 1)[0];
      if (removido.imagem && fs.existsSync(path.join(__dirname, removido.imagem))) {
        fs.unlinkSync(path.join(__dirname, removido.imagem));
      }
      salvarDados(dados);
      return res.json({ ok: true, produto: removido });
    }
  }
  res.status(404).json({ erro: 'produto não encontrado' });
});

app.post('/api/upload', upload.single('imagem'), (req, res) => {
  if (!req.file) return res.status(400).json({ erro: 'arquivo não enviado' });
  const caminho = 'imagens/' + req.file.filename;
  res.json({ ok: true, caminho });
});

app.delete('/api/imagens/:filename', (req, res) => {
  const caminho = path.join(IMAGENS_DIR, req.params.filename);
  if (fs.existsSync(caminho)) {
    fs.unlinkSync(caminho);
    res.json({ ok: true });
  } else {
    res.status(404).json({ erro: 'arquivo não encontrado' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Painel admin: http://localhost:${PORT}/admin.html`);
});
