/* =================== CONFIGURAÇÃO (edite aqui) =================== */
const CONFIG = {
  patricia: { nome: 'Tia Patrícia', tel: '+55 11 99692-9358', wa: '5511996929358' }, // CONFIRA
  vitor:    { nome: 'Tio Vitor',    tel: '+55 11 98406-1754', wa: '5511984061754' }, // CONFIRA
  msg:     'Oi! Vi o site da van e quero saber sobre vagas para 2027.',
  msgVale: 'Oi! Quero me matricular na van para a turma de 2027 e usar o vale desconto PV: 20% na primeira mensalidade (válido até 15/01/2027). Segue o bilhete.',
  msgVaga: 'Oi! Quero uma vaga na van para 2027. Seguem meus dados:',
  series: ['Pré', '1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano', '1ª série do Ensino Médio', '2ª série do Ensino Médio', '3ª série do Ensino Médio'],
  paradas: [
    { nome: 'Terminal Fátima',   lat: -23.5547, lng: -46.9056 }, // Terminal N. Sra. de Fátima, Jandira
    { nome: 'Parque Viana',      lat: -23.5399, lng: -46.8701 }, // Barueri
    { nome: 'Jardim Tupanci',    lat: -23.4945, lng: -46.8701 }, // Barueri
    { nome: 'Engenho Novo',      lat: -23.4892, lng: -46.8897 }, // Barueri
    { nome: 'Fundação Bradesco', lat: -23.5456, lng: -46.7716 }, // Osasco (conferido no Google Maps)
  ],
};

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('[data-wa]').forEach(a => {
  const c = CONFIG[a.dataset.wa];
  const m = a.dataset.msg === 'vale' ? CONFIG.msgVale : CONFIG.msg;
  a.href = `https://wa.me/${c.wa}?text=${encodeURIComponent(m)}`;
});
document.querySelectorAll('[data-tel]').forEach(s => { s.textContent = CONFIG[s.dataset.tel].tel; });
document.getElementById('ano').textContent = new Date().getFullYear();

/* =================== FOLHINHA (mês de hoje → janeiro de 2027) =================== */
const fol = document.getElementById('fol');
if (fol) {
  const hoje = new Date(), meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  document.getElementById('fol-mes').textContent = meses[hoje.getMonth()];
  document.getElementById('fol-ano').textContent = hoje.getFullYear();
  if (hoje >= new Date(2027, 0, 1)) { fol.classList.add('parada'); fol.querySelector('.pg-jan small').textContent = 'a turma começou'; }
}

/* =================== BARRA FIXA E MENU DO CELULAR =================== */
const nav = document.getElementById('nav'), hero = document.getElementById('top'), burger = document.getElementById('burger');
const navScroll = () => nav.classList.toggle('on', scrollY > hero.offsetHeight - 80);
addEventListener('scroll', navScroll, { passive: true }); navScroll();
function menu(on) {
  document.body.classList.toggle('menu-on', on);
  document.querySelectorAll('[data-menu]').forEach(b => b.setAttribute('aria-expanded', on));
  burger.textContent = on ? 'Fechar' : 'Menu';
}
document.querySelectorAll('[data-menu]').forEach(b => b.addEventListener('click', () => menu(!document.body.classList.contains('menu-on'))));
document.getElementById('sheet-bg').addEventListener('click', () => menu(false));
document.querySelectorAll('#menu a').forEach(a => a.addEventListener('click', () => menu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') menu(false); });

/* =================== BILHETE DO TOPO (o canhoto rasga e a página desce até o pré-cadastro) =================== */
const bilhete = document.getElementById('bilhete'), blBtn = document.getElementById('bl-btn');
if (bilhete && blBtn) {
  let rasgando = false;
  blBtn.addEventListener('click', e => {
    const alvo = document.getElementById('vaga');
    if (!alvo) return; /* sem a seção, o link segue o caminho normal */
    e.preventDefault();
    if (reduce) { alvo.scrollIntoView(); return; }
    if (rasgando) return;
    rasgando = true;
    bilhete.classList.add('rasgou');
    setTimeout(() => alvo.scrollIntoView({ behavior: 'smooth' }), 1000);
    /* depois que a página desceu, o bilhete volta inteiro (para quem voltar ao topo) */
    setTimeout(() => { bilhete.classList.remove('rasgou'); rasgando = false; }, 2600);
  });
}

/* =================== ESTRADA DA HISTÓRIA (a van anda com a rolagem e acende cada ano) ===================
   --p vai de 0 a 1: 0 = a seção acabou de aparecer embaixo da tela, 1 = já passou quase toda.
   Cada foto acende quando a van chega perto dela. Quem pediu "menos movimento" vê tudo aceso. */
const estrada = document.getElementById('estrada');
if (estrada && !reduce) {
  const itensE = [...estrada.querySelectorAll('.est-item')], paresE = [...estrada.querySelectorAll('.est-pare')];
  const LIMITES = [0.02, 0.5, 0.98]; /* em que ponto da estrada cada foto acende */
  estrada.classList.add('anima');
  let pedido = false;
  const andar = () => {
    pedido = false;
    const r = estrada.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.15 + r.height)));
    estrada.style.setProperty('--p', p.toFixed(3));
    itensE.forEach((it, i) => {
      const on = p >= LIMITES[i];
      it.classList.toggle('on', on);
      if (paresE[i]) paresE[i].classList.toggle('on', on);
    });
  };
  const pedir = () => { if (!pedido) { pedido = true; requestAnimationFrame(andar); } };
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', pedir);
  andar();
}

/* =================== MAPA (cinza escuro + rota real, linha amarela da rodoviária) =================== */
async function iniciarMapa() {
  const P = CONFIG.paradas, badge = document.getElementById('kmbadge');
  const map = L.map('mapa', { scrollWheelZoom: false, dragging: !L.Browser.mobile });
  const escuro = L.layerGroup([
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16, attribution: 'Esri, HERE, Garmin, © OpenStreetMap' }),
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16 })
  ]);
  const sat = L.layerGroup([
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Imagens © Esri, Maxar, Earthstar Geographics' }),
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 })
  ]);
  escuro.addTo(map);
  L.control.layers({ 'Mapa escuro': escuro, 'Satélite': sat }).addTo(map);

  let coords = P.map(p => [p.lat, p.lng]);
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${P.map(p => p.lng + ',' + p.lat).join(';')}?overview=full&geometries=geojson`;
    const j = await (await fetch(url)).json();
    if (j.code === 'Ok') {
      const rt = j.routes[0];
      coords = rt.geometry.coordinates.map(c => [c[1], c[0]]);
      badge.textContent = `≈ ${(rt.distance / 1000).toFixed(1).replace('.', ',')} km · ${Math.round(rt.duration / 60)} min`;
    } else badge.remove();
  } catch (e) { badge.remove(); }

  L.polyline(coords, { color: '#F6C510', weight: 18, opacity: .1, interactive: false }).addTo(map);
  L.polyline(coords, { color: '#F6C510', weight: 10, opacity: .22, interactive: false }).addTo(map);
  const linha = L.polyline(coords, { color: '#F6C510', weight: 4, opacity: 1, interactive: false }).addTo(map);
  L.polyline(coords, { color: '#FFF3C4', weight: 2, opacity: .9, dashArray: '2 12', className: 'rota-fluxo', interactive: false }).addTo(map);
  map.fitBounds(linha.getBounds(), { padding: [50, 50] });
  P.forEach((p, i) => L.marker([p.lat, p.lng], { keyboard: false, icon: L.divIcon({ className: '', html: `<span class="parada">${i + 1}</span>`, iconSize: [26, 26], iconAnchor: [13, 13] }) }).bindTooltip(p.nome, { permanent: true, direction: 'top', offset: [0, -16], className: 'etq' }).addTo(map));
}
iniciarMapa();

/* =================== VALE DESCONTO (quadro de partidas + bilheteria que imprime o bilhete) =================== */
const vale = document.getElementById('vale');
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
/* Monta as plaquinhas a partir do texto de cada linha (data-t) e devolve a função que faz elas girarem */
function montarQuadro(quadro) {
  if (!quadro) return () => {};
  const placas = [];
  quadro.querySelectorAll('.linha').forEach((linha, r) => {
    Array.from(linha.dataset.t || '').forEach((c, i) => {
      const p = document.createElement('span');
      p.className = 'pl' + (i < 7 ? ' rot' : '');
      linha.appendChild(p);
      placas.push({ p, c: c.trim(), r, i });
    });
  });
  function virar(p, final, atraso) {
    if (reduce) { p.textContent = final; return; }
    let voltas = 3 + Math.floor(Math.random() * 5);
    setTimeout(function passo() {
      p.classList.remove('gira'); void p.offsetWidth; p.classList.add('gira');
      if (voltas-- <= 0) { p.textContent = final; return; }
      p.textContent = LETRAS[Math.floor(Math.random() * LETRAS.length)];
      setTimeout(passo, 70);
    }, atraso);
  }
  return () => placas.forEach(({ p, c, r, i }) => virar(p, c, 150 + r * 120 + i * 45));
}
if (vale) {
  const girarQuadro = montarQuadro(vale.querySelector('.vale-quadro'));
  /* "in" liga, em sequência: luz piscando, bilhete saindo da fenda, carimbo e o texto */
  const imprimir = () => { vale.classList.add('in'); girarQuadro(); };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { imprimir(); io.disconnect(); } }, { threshold: .3 });
    io.observe(vale);
  } else imprimir();
}

/* =================== VALE: desenha o bilhete em imagem e envia pelo WhatsApp =================== */
const btnVale = document.getElementById('btn-vale');
function rrPath(x, y, w, h, r) { const p = new Path2D(); if (p.roundRect) p.roundRect(x, y, w, h, r); else p.rect(x, y, w, h); return p; }
function carinha(x, px, py, s, dark, yel) {
  const R = (a, b, w, h, r, fill, stroke) => { const p = rrPath(px + a * s, py + b * s, w * s, h * s, r * s); if (fill) { x.fillStyle = fill; x.fill(p); } if (stroke) { x.lineWidth = 3 * s; x.strokeStyle = stroke; x.stroke(p); } };
  R(14, 10, 72, 72, 16, dark); R(22, 18, 56, 26, 7, yel); R(14, 50, 72, 6, 0, '#F4845F');
  R(6, 30, 7, 12, 2.5, dark); R(87, 30, 7, 12, 2.5, dark); R(22, 60, 14, 9, 4.5, yel); R(64, 60, 14, 9, 4.5, yel);
  x.beginPath(); x.moveTo(px + 40 * s, py + 66 * s); x.quadraticCurveTo(px + 50 * s, py + 74 * s, px + 60 * s, py + 66 * s); x.lineWidth = 4 * s; x.lineCap = 'round'; x.strokeStyle = yel; x.stroke();
  R(20, 78, 18, 12, 4, yel, dark); R(62, 78, 18, 12, 4, yel, dark);
}
function placa(x, px, py, size) { x.fillStyle = '#F6C510'; x.fill(rrPath(px, py, size, size, size * 13 / 60)); carinha(x, px + size * 3.5 / 60, py + size * 3.5 / 60, size * 53 / 60 / 100, '#0B0B0B', '#F6C510'); }
async function desenharVale() {
  /* Imagem de 360 × 240 (× 4 para ficar nítida): fundo da rodoviária e o bilhete de 320 × 200 no meio */
  const k = 4, CW = 360, CH = 240, W = 320, H = 200, ox = 20, oy = 20;
  const c = document.createElement('canvas'); c.width = CW * k; c.height = CH * k;
  const x = c.getContext('2d');
  const X = n => (ox + n) * k, Y = n => (oy + n) * k;
  const MONO = "'IBM Plex Mono',ui-monospace,Menlo,Consolas,monospace", SANS = 'Inter,system-ui,sans-serif';
  try { await Promise.all([document.fonts.load('700 40px Inter'), document.fonts.load('600 40px Inter'), document.fonts.load('500 40px Inter'), document.fonts.load("600 40px 'IBM Plex Mono'")]); } catch (e) { /* segue com a letra do aparelho */ }
  const T = (t, px, py, tam, peso, cor, fam, ls, alinhar) => {
    x.font = `${peso} ${tam * k}px ${fam || SANS}`; x.fillStyle = cor; x.textAlign = alinhar || 'left';
    if ('letterSpacing' in x) x.letterSpacing = (ls || 0) * k + 'px';
    x.fillText(t, X(px), Y(py));
  };
  x.textBaseline = 'alphabetic';

  /* fundo grafite e papel do bilhete (com o canhoto mais escuro embaixo) */
  x.fillStyle = '#141416'; x.fillRect(0, 0, c.width, c.height);
  x.save(); x.clip(rrPath(X(0), Y(0), W * k, H * k, 14 * k));
  x.fillStyle = '#FBF8F1'; x.fillRect(X(0), Y(0), W * k, H * k);
  x.fillStyle = '#F3EBDA'; x.fillRect(X(0), Y(150), W * k, 50 * k);
  x.restore();

  /* topo */
  T('VALE DESCONTO · TURMA 2027', 20, 30, 8.5, 600, '#8A7F74', SANS, 1.4);
  placa(x, X(270), Y(12), 30 * k);
  x.fillStyle = '#E8E1D2'; x.fillRect(X(20), Y(50), 280 * k, k);

  /* origem e destino */
  T('ORIGEM', 20, 68, 8, 600, '#8A7F74', SANS, 1.2);
  T('DESTINO', 300, 68, 8, 600, '#8A7F74', SANS, 1.2, 'right');
  T('JDR', 20, 98, 30, 600, '#1A1410', MONO, -0.5);
  T('CDD', 300, 98, 30, 600, '#1A1410', MONO, -0.5, 'right');
  T('Jandira e Barueri', 20, 114, 9.5, 500, '#5A5047');
  T('Fundação Bradesco', 300, 114, 9.5, 500, '#5A5047', SANS, 0, 'right');
  x.save(); x.setLineDash([4 * k, 4 * k]); x.strokeStyle = '#C9BFAA'; x.lineWidth = 1.5 * k;
  x.beginPath(); x.moveTo(X(96), Y(86)); x.lineTo(X(224), Y(86)); x.stroke(); x.restore();

  /* o desconto */
  T('20% de desconto', 20, 138, 12, 700, '#1A1410');
  const w20 = x.measureText('20% de desconto').width / k;
  T('na 1ª mensalidade', 20 + w20 + 5, 138, 11, 500, '#5A5047');

  /* picote, com os "furinhos" das pontas na cor do fundo */
  x.save(); x.setLineDash([2 * k, 4 * k]); x.lineCap = 'round'; x.strokeStyle = 'rgba(10,6,8,.55)'; x.lineWidth = 2.5 * k;
  x.beginPath(); x.moveTo(X(14), Y(150)); x.lineTo(X(306), Y(150)); x.stroke(); x.restore();
  x.fillStyle = '#141416'; [0, W].forEach(px => { x.beginPath(); x.arc(X(px), Y(150), 9 * k, 0, Math.PI * 2); x.fill(); });

  /* canhoto */
  T('Válido até 15/01/2027', 20, 174, 10.5, 600, '#1A1410');
  T('Só para novos contratos', 20, 189, 9, 500, '#5A5047');
  let bx = 228; x.fillStyle = '#1A1410';
  [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2].forEach(w => { x.fillRect(X(bx), Y(162), w * k, 28 * k); bx += w + 1.5; });

  /* carimbo vermelho no meio do trilho */
  x.save(); x.translate(X(160), Y(84)); x.rotate(-14 * Math.PI / 180);
  x.fillStyle = 'rgba(251,248,241,.75)'; x.beginPath(); x.arc(0, 0, 32 * k, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#C62828'; x.lineWidth = 3 * k; x.beginPath(); x.arc(0, 0, 32 * k, 0, Math.PI * 2); x.stroke();
  x.lineWidth = k; x.beginPath(); x.arc(0, 0, 27 * k, 0, Math.PI * 2); x.stroke();
  x.fillStyle = '#C62828'; x.textAlign = 'center';
  if ('letterSpacing' in x) x.letterSpacing = 1.6 * k + 'px';
  x.font = `600 ${7 * k}px ${SANS}`; x.fillText('VALE PV', 0, -9 * k);
  if ('letterSpacing' in x) x.letterSpacing = '0px';
  x.font = `600 ${17 * k}px ${MONO}`; x.fillText('-20%', 0, 11 * k);
  x.restore();

  return new Promise(res => c.toBlob(res, 'image/png'));
}
async function enviarVale() {
  const txt = CONFIG.msgVale, url = 'https://wa.me/' + CONFIG.patricia.wa + '?text=' + encodeURIComponent(txt);
  btnVale.disabled = true;
  try {
    const blob = await desenharVale();
    const file = new File([blob], 'vale-desconto-pv-2027.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: txt }); return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  } catch (e) { if (e && e.name === 'AbortError') return; }
  finally { btnVale.disabled = false; }
  if (!window.open(url, '_blank')) location.href = url;
}
if (btnVale) btnVale.addEventListener('click', enviarVale);

/* =================== CARTÕES DA LOUSA (sobem ao entrar na tela) =================== */
if ('IntersectionObserver' in window) {
  const itens = document.querySelectorAll('.rv');
  itens.forEach(e => e.classList.add('esp'));
  const ioR = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); ioR.unobserve(e.target); } }); }, { threshold: .2 });
  itens.forEach(e => ioR.observe(e));
}

/* =================== PRÉ-CADASTRO (vira carta, fecha e abre o WhatsApp) =================== */
const formVaga = document.getElementById('form-vaga'), carta = document.getElementById('carta');
if (formVaga) {
  const selSerie = document.getElementById('serie');
  CONFIG.series.forEach(s => { const o = document.createElement('option'); o.textContent = s; selSerie.appendChild(o); });
  const abrirZap = url => { if (!window.open(url, '_blank')) location.href = url; };
  formVaga.addEventListener('submit', e => {
    e.preventDefault();
    if (carta.classList.contains('enviando')) return;
    const f = new FormData(formVaga), v = k => (f.get(k) || '').toString().trim() || '—';
    const txt = [CONFIG.msgVaga, '', 'Nome: ' + v('nome'), 'Criança: ' + v('crianca'), 'Idade: ' + v('idade'), 'WhatsApp: ' + v('tel'), 'E-mail: ' + v('email'), 'Rua: ' + v('rua'), 'CEP: ' + v('cep'), 'Referência: ' + v('ref'), 'Série: ' + v('serie'), 'Turma: ' + v('turma')].join('\n');
    const url = 'https://wa.me/' + CONFIG.patricia.wa + '?text=' + encodeURIComponent(txt);
    if (reduce) { abrirZap(url); return; }
    carta.classList.add('enviando');
    setTimeout(() => abrirZap(url), 2000);
    setTimeout(() => carta.classList.remove('enviando'), 6000);
  });
  addEventListener('pageshow', () => carta.classList.remove('enviando'));
}