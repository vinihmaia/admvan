/* =================== DEMONSTRAÇÃO: os dados ficam só neste navegador (localStorage), sem banco =================== */
const CHAVE = 'pv_gestao_demo_v1', LUGARES = 23;
const SERIES = ['Pré', '1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano', '1ª série do Ensino Médio', '2ª série do Ensino Médio', '3ª série do Ensino Médio'];
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/* ---------- ajudantes ---------- */
const agora = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);
const novoToken = () => uid() + uid();
const soDigitos = s => (s || '').replace(/\D/g, '');
const fmtCPF = d => { d = soDigitos(d); return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : d; };
const fmtBRL = n => (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtData = (iso, hora) => { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('pt-BR') + (hora ? ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''); };
const fmtDia = s => s ? s.split('-').reverse().join('/') : '—';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function hashTexto(t) { let h = 5381; for (const ch of t) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0; return h.toString(16).padStart(8, '0'); }
let tt; function toast(m) { const el = document.getElementById('toast'); el.textContent = m; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 2800); }
async function copiar(t) { try { await navigator.clipboard.writeText(t); toast('Link copiado. Cole no WhatsApp do responsável.'); } catch (e) { prompt('Copie o link:', t); } }
const linkAssinatura = c => location.origin + location.pathname + '#assinar/' + c.token;
const achar = id => DB.contratos.find(c => c.id === id);
const logado = () => sessionStorage.getItem('pv_login');

/* ---------- dados de exemplo ---------- */
function semente() {
  const c = o => Object.assign({ id: uid(), token: novoToken(), criadoEm: '2026-10-05T12:00:00Z', status: 'rascunho', pagamentos: {}, assinatura: null, enviadoEm: null, obs: '', inicio: '2027-01-01', fim: '2027-12-31', vencimento: 10 }, o);
  return [
    c({ status: 'assinado', responsavel: { nome: 'Ana Souza (exemplo)', cpf: '12345678901', tel: '(11) 9 9999-0001', email: 'ana@exemplo.com' }, crianca: { nome: 'Miguel', serie: '3º ano' }, turma: 'Manhã', endereco: 'Rua das Flores, 120', bairro: 'Jardim Gabriela', mensalidade: 480, vale: true, enviadoEm: '2026-10-10T14:00:00Z', assinatura: { nome: 'Ana Souza', cpf: '12345678901', em: '2026-10-12T19:32:00Z', ip: '187.0.0.1 (exemplo)', hash: 'a1b2c3d4' } }),
    c({ status: 'aguardando', responsavel: { nome: 'Carlos Lima (exemplo)', cpf: '98765432100', tel: '(11) 9 9999-0002', email: 'carlos@exemplo.com' }, crianca: { nome: 'Laura', serie: 'Pré' }, turma: 'Tarde', endereco: 'Av. Brasil, 45', bairro: 'Parque Viana', mensalidade: 480, vale: false, enviadoEm: '2026-10-14T10:20:00Z' }),
    c({ status: 'rascunho', responsavel: { nome: 'Juliana Reis (exemplo)', cpf: '11122233344', tel: '(11) 9 9999-0003', email: 'juliana@exemplo.com' }, crianca: { nome: 'Pedro', serie: '6º ano' }, turma: 'Manhã', endereco: 'Rua Tupanci, 300', bairro: 'Jardim Tupanci', mensalidade: 500, vale: true }),
    c({ status: 'assinado', responsavel: { nome: 'Marcos Oliveira (exemplo)', cpf: '55566677788', tel: '(11) 9 9999-0004', email: 'marcos@exemplo.com' }, crianca: { nome: 'Sofia', serie: '1º ano' }, turma: 'Tarde', endereco: 'Rua Engenho Novo, 18', bairro: 'Vila Engenho Novo', mensalidade: 480, vale: true, enviadoEm: '2026-10-08T09:00:00Z', assinatura: { nome: 'Marcos Oliveira', cpf: '55566677788', em: '2026-10-09T21:05:00Z', ip: '187.0.0.2 (exemplo)', hash: 'e5f6a7b8' } }),
  ];
}
function carregar() { try { const j = JSON.parse(localStorage.getItem(CHAVE)); if (j && Array.isArray(j.contratos)) return j; } catch (e) { } const d = { contratos: semente() }; localStorage.setItem(CHAVE, JSON.stringify(d)); return d; }
function salvar() { localStorage.setItem(CHAVE, JSON.stringify(DB)); }
let DB = carregar();

/* ---------- texto do contrato (MODELO DE DEMONSTRAÇÃO) ---------- */
function textoContrato(c, html) {
  const v = s => html ? '<strong>' + esc(s) + '</strong>' : String(s);
  const linhas = [
    'CONTRATO DE PRESTAÇÃO DE SERVIÇO DE TRANSPORTE ESCOLAR · TURMA 2027',
    '(modelo de demonstração: as cláusulas definitivas serão definidas com a Tia Patrícia)', '',
    'CONTRATADA: Van Escolar Tia Patrícia e Tio Vitor.',
    'CONTRATANTE: ' + v(c.responsavel.nome) + ', CPF ' + v(fmtCPF(c.responsavel.cpf)) + ', telefone ' + v(c.responsavel.tel) + ', e-mail ' + v(c.responsavel.email) + '.',
    'ALUNO(A): ' + v(c.crianca.nome) + ', ' + v(c.crianca.serie) + ', turma da ' + v(c.turma.toLowerCase()) + '.',
    'ENDEREÇO DE EMBARQUE: ' + v(c.endereco) + ', ' + v(c.bairro) + '.', '',
    '1. OBJETO. Transporte do(a) aluno(a) entre o endereço acima e a Fundação Bradesco (Cidade de Deus, Osasco), ida e volta, nos dias letivos.',
    '2. VIGÊNCIA. De ' + v(fmtDia(c.inicio)) + ' a ' + v(fmtDia(c.fim)) + '.',
    '3. MENSALIDADE. ' + v(fmtBRL(c.mensalidade)) + ' por mês, com vencimento todo dia ' + v(c.vencimento) + ', em dinheiro ou Pix, durante 12 meses, inclusive janeiro e fevereiro.',
    c.vale ? '3.1. VALE DESCONTO PV. Na primeira mensalidade será aplicado desconto de 20%.' : null,
    '4. FALTAS. O responsável avisa pelo WhatsApp com antecedência, inclusive em caso de atestado médico.',
    '5. RESCISÃO. [a definir com a Tia Patrícia]',
    '6. OUTRAS CONDIÇÕES. ' + v(c.obs || '—'), '',
    'Ao assinar eletronicamente, o CONTRATANTE declara que leu e concorda com todas as cláusulas acima.'
  ].filter(l => l !== null);
  return linhas.join('\n');
}

/* ---------- navegação por #rota ---------- */
function mostrar(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function rota() {
  const h = location.hash.slice(1) || 'contratos', [tela, param] = h.split('/');
  if (tela === 'assinar') { mostrar('tela-assinar'); telaAssinar(param); window.scrollTo(0, 0); return; }
  if (!logado()) { mostrar('tela-login'); return; }
  mostrar('app');
  document.getElementById('quem-email').textContent = logado();
  const grupo = (tela === 'novo' || tela === 'contrato') ? 'contratos' : tela;
  document.querySelectorAll('.tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === grupo));
  const mapa = { contratos: 'tela-contratos', novo: 'tela-novo', contrato: 'tela-detalhe', financeiro: 'tela-financeiro', responsaveis: 'tela-responsaveis' };
  const alvo = mapa[tela] || 'tela-contratos';
  document.querySelectorAll('#app .screen').forEach(s => s.classList.toggle('active', s.id === alvo));
  if (alvo === 'tela-contratos') renderContratos();
  if (alvo === 'tela-novo') telaNovo(param);
  if (alvo === 'tela-detalhe') telaDetalhe(param);
  if (alvo === 'tela-financeiro') renderFinanceiro();
  if (alvo === 'tela-responsaveis') renderResponsaveis();
  window.scrollTo(0, 0);
}
addEventListener('hashchange', rota);

/* ---------- login (de demonstração: qualquer e-mail entra) ---------- */
document.getElementById('form-login').addEventListener('submit', e => { e.preventDefault(); const em = document.getElementById('login-email').value.trim(); if (!em) return; sessionStorage.setItem('pv_login', em); location.hash = '#contratos'; rota(); });
document.getElementById('sair').addEventListener('click', () => { sessionStorage.removeItem('pv_login'); location.hash = '#login'; rota(); });

/* ---------- contratos: lista ---------- */
let filtro = 'todos', busca = '';
const rotulo = c => ({ assinado: 'Assinado ' + fmtData(c.assinatura && c.assinatura.em), aguardando: 'Aguardando assinatura', rascunho: 'Rascunho', cancelado: 'Cancelado' })[c.status];
function renderContratos() {
  const cs = DB.contratos, n = s => cs.filter(c => c.status === s).length;
  document.getElementById('st-assinado').textContent = n('assinado');
  document.getElementById('st-aguardando').textContent = n('aguardando');
  document.getElementById('st-rascunho').textContent = n('rascunho');
  const ocup = t => cs.filter(c => c.status === 'assinado' && c.turma === t).length;
  document.getElementById('st-vagas').textContent = 'M ' + (LUGARES - ocup('Manhã')) + ' · T ' + (LUGARES - ocup('Tarde'));
  const b = busca.toLowerCase();
  const lista = cs.filter(c => (filtro === 'todos' || c.status === filtro) && (!b || (c.responsavel.nome + ' ' + c.crianca.nome + ' ' + c.bairro).toLowerCase().includes(b)));
  const acao = c => c.status === 'aguardando' ? `<button class="btn ghost sm" data-copiar="${c.id}">Copiar link</button>` : c.status === 'assinado' ? `<button class="btn ghost sm" data-pdf="${c.id}">PDF</button>` : c.status === 'rascunho' ? `<button class="btn ghost sm" data-editar="${c.id}">Editar</button>` : '';
  document.getElementById('tab-contratos').innerHTML = lista.length ? lista.map(c => `<tr class="clicavel" data-id="${c.id}"><td>${esc(c.responsavel.nome)}<small>${esc(c.responsavel.tel)}</small></td><td>${esc(c.crianca.nome)}<small>${esc(c.crianca.serie)}</small></td><td>${esc(c.turma)}</td><td>${fmtBRL(c.mensalidade)}</td><td><span class="tag ${c.status}">${rotulo(c)}</span></td><td>${acao(c)}</td></tr>`).join('') : '<tr><td colspan="6" class="vazio">Nenhum contrato aqui.</td></tr>';
}
document.getElementById('tab-contratos').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) { e.stopPropagation(); if (b.dataset.copiar) copiar(linkAssinatura(achar(b.dataset.copiar))); if (b.dataset.pdf) abrirPDF(achar(b.dataset.pdf)); if (b.dataset.editar) location.hash = '#novo/' + b.dataset.editar; return; }
  const tr = e.target.closest('tr[data-id]'); if (tr) location.hash = '#contrato/' + tr.dataset.id;
});
document.querySelectorAll('.chip[data-f]').forEach(ch => ch.addEventListener('click', () => { filtro = ch.dataset.f; document.querySelectorAll('.chip[data-f]').forEach(x => x.classList.toggle('on', x === ch)); renderContratos(); }));
document.getElementById('busca').addEventListener('input', e => { busca = e.target.value; renderContratos(); });
document.getElementById('exportar').addEventListener('click', () => {
  const cab = ['Responsável', 'CPF', 'WhatsApp', 'E-mail', 'Criança', 'Série', 'Turma', 'Bairro', 'Mensalidade', 'Status', 'Assinado em'];
  const linhas = DB.contratos.map(c => [c.responsavel.nome, fmtCPF(c.responsavel.cpf), c.responsavel.tel, c.responsavel.email, c.crianca.nome, c.crianca.serie, c.turma, c.bairro, c.mensalidade, c.status, c.assinatura ? fmtData(c.assinatura.em, true) : '']);
  const csv = [cab, ...linhas].map(l => l.map(x => '"' + String(x ?? '').replace(/"/g, '""') + '"').join(';')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })); a.download = 'contratos-2027.csv'; a.click();
});
document.getElementById('reset-demo').addEventListener('click', () => { if (confirm('Apagar tudo e voltar aos exemplos?')) { localStorage.removeItem(CHAVE); DB = carregar(); renderContratos(); toast('Demonstração reiniciada.'); } });

/* ---------- contratos: novo / editar ---------- */
const formC = document.getElementById('form-contrato');
SERIES.forEach(s => { const o = document.createElement('option'); o.textContent = s; formC.elements.serie.appendChild(o); });
function telaNovo(id) {
  formC.reset(); document.getElementById('erro-contrato').textContent = '';
  formC.elements.id.value = ''; formC.elements.inicio.value = '2027-01-01'; formC.elements.fim.value = '2027-12-31'; formC.elements.vencimento.value = 10;
  document.getElementById('novo-titulo').textContent = id ? 'Editar contrato' : 'Novo contrato';
  const c = id && achar(id); if (!c) return;
  const f = formC.elements; f.id.value = c.id; f.nome.value = c.responsavel.nome; f.cpf.value = fmtCPF(c.responsavel.cpf); f.tel.value = c.responsavel.tel; f.email.value = c.responsavel.email; f.crianca.value = c.crianca.nome; f.serie.value = c.crianca.serie; f.turma.value = c.turma; f.endereco.value = c.endereco; f.bairro.value = c.bairro; f.mensalidade.value = c.mensalidade; f.vencimento.value = c.vencimento; f.inicio.value = c.inicio; f.fim.value = c.fim; f.vale.value = c.vale ? 'sim' : 'nao'; f.obs.value = c.obs || '';
}
function lerForm() {
  const f = formC.elements;
  return { responsavel: { nome: f.nome.value.trim(), cpf: soDigitos(f.cpf.value), tel: f.tel.value.trim(), email: f.email.value.trim() }, crianca: { nome: f.crianca.value.trim(), serie: f.serie.value }, turma: f.turma.value, endereco: f.endereco.value.trim(), bairro: f.bairro.value.trim(), mensalidade: Number(f.mensalidade.value), vencimento: Number(f.vencimento.value) || 10, inicio: f.inicio.value, fim: f.fim.value, vale: f.vale.value === 'sim', obs: f.obs.value.trim() };
}
function validar(d) {
  if (!d.responsavel.nome) return 'Preencha o nome do responsável.';
  if (d.responsavel.cpf.length !== 11) return 'O CPF precisa ter 11 números.';
  if (!d.responsavel.email) return 'Preencha o e-mail: é por ele que chega o código de assinatura.';
  if (!d.crianca.nome) return 'Preencha o nome da criança.';
  if (!d.crianca.serie) return 'Escolha a série.';
  if (!d.turma) return 'Escolha a turma.';
  if (!(d.mensalidade > 0)) return 'Informe a mensalidade.';
  return '';
}
function gravar(status) {
  const d = lerForm(), erro = validar(d); document.getElementById('erro-contrato').textContent = erro; if (erro) return;
  const id = formC.elements.id.value; let c = id && achar(id);
  if (c) Object.assign(c, d); else { c = Object.assign({ id: uid(), token: novoToken(), criadoEm: agora(), pagamentos: {}, assinatura: null, enviadoEm: null }, d); DB.contratos.unshift(c); }
  c.status = status; if (status === 'aguardando' && !c.enviadoEm) c.enviadoEm = agora();
  salvar(); location.hash = '#contrato/' + c.id;
  toast(status === 'aguardando' ? 'Contrato gerado. Copie o link e envie no WhatsApp.' : 'Rascunho salvo.');
}
formC.addEventListener('submit', e => { e.preventDefault(); gravar('aguardando'); });
document.getElementById('salvar-rascunho').addEventListener('click', () => gravar('rascunho'));

/* ---------- contratos: detalhe ---------- */
let atual = null;
function telaDetalhe(id) {
  const c = achar(id); if (!c) { location.hash = '#contratos'; return; } atual = c;
  document.getElementById('det-titulo').textContent = c.responsavel.nome + ' · ' + c.crianca.nome;
  document.getElementById('det-status').innerHTML = `<span class="tag ${c.status}">${rotulo(c)}</span>`;
  const kv = [['Responsável', c.responsavel.nome], ['CPF', fmtCPF(c.responsavel.cpf)], ['WhatsApp', c.responsavel.tel], ['E-mail', c.responsavel.email], ['Criança', c.crianca.nome], ['Série em 2027', c.crianca.serie], ['Turma', c.turma], ['Endereço', c.endereco + (c.bairro ? ', ' + c.bairro : '')], ['Mensalidade', fmtBRL(c.mensalidade) + ' · vence dia ' + c.vencimento], ['Vigência', fmtDia(c.inicio) + ' a ' + fmtDia(c.fim)], ['Vale desconto PV', c.vale ? 'Sim, 20% na 1ª mensalidade' : 'Não'], ['Observações', c.obs || '—']];
  document.getElementById('det-kv').innerHTML = kv.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('');
  const temLink = c.status === 'aguardando' || c.status === 'assinado';
  document.getElementById('det-linkbox').hidden = !temLink; document.getElementById('det-link').value = temLink ? linkAssinatura(c) : '';
  const a = c.assinatura;
  const passos = [['Rascunho criado', fmtData(c.criadoEm, true), true], ['Link de assinatura gerado', c.enviadoEm ? fmtData(c.enviadoEm, true) : 'ainda não', !!c.enviadoEm], ['Assinado pelo responsável', a ? `${a.nome} · CPF ${fmtCPF(a.cpf)} · ${fmtData(a.em, true)} · IP ${a.ip} · impressão digital ${a.hash}` : 'ainda não', !!a]];
  if (c.status === 'cancelado') passos.push(['Contrato cancelado', '', true]);
  let marcouAtual = false;
  document.getElementById('det-tl').innerHTML = passos.map(([t, s, feito], i) => { const cls = feito ? 'feito' : (!marcouAtual ? (marcouAtual = true, 'atual') : ''); return `<li class="${cls}"><i>${feito ? '✓' : i + 1}</i><div>${t}<small>${esc(s)}</small></div></li>`; }).join('');
  const mostra = (id, sim) => { document.getElementById(id).hidden = !sim; };
  mostra('det-gerar', c.status === 'rascunho'); mostra('det-editar', c.status === 'rascunho'); mostra('det-copiar', c.status === 'aguardando'); mostra('det-abrir', c.status === 'aguardando'); mostra('det-pdf', c.status !== 'rascunho'); mostra('det-cancelar', c.status === 'rascunho' || c.status === 'aguardando');
}
document.getElementById('det-gerar').addEventListener('click', () => { atual.status = 'aguardando'; atual.enviadoEm = atual.enviadoEm || agora(); salvar(); telaDetalhe(atual.id); toast('Link gerado. Copie e envie no WhatsApp.'); });
document.getElementById('det-editar').addEventListener('click', () => { location.hash = '#novo/' + atual.id; });
document.getElementById('det-copiar').addEventListener('click', () => copiar(linkAssinatura(atual)));
document.getElementById('det-abrir').addEventListener('click', () => { location.hash = '#assinar/' + atual.token; });
document.getElementById('det-pdf').addEventListener('click', () => abrirPDF(atual));
document.getElementById('det-cancelar').addEventListener('click', () => { if (confirm('Cancelar este contrato?')) { atual.status = 'cancelado'; salvar(); telaDetalhe(atual.id); toast('Contrato cancelado.'); } });

/* ---------- PDF: abre uma página pronta para "Salvar como PDF" ---------- */
function abrirPDF(c) {
  const w = window.open('', '_blank'); if (!w) { toast('O navegador bloqueou a janela. Permita pop-ups para gerar o PDF.'); return; }
  const a = c.assinatura;
  const ass = a ? `ASSINATURA ELETRÔNICA\nAssinado por ${a.nome}, CPF ${fmtCPF(a.cpf)}, em ${fmtData(a.em, true)}.\nEndereço de rede (IP): ${a.ip}\nImpressão digital do documento: ${a.hash}` : 'Documento ainda sem assinatura.';
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Contrato ${esc(c.crianca.nome)} · 2027</title><style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.6;color:#111}pre{white-space:pre-wrap;font:inherit;margin:0}.ass{margin-top:32px;padding:16px;border:1px solid #999;font-size:14px}.dica{font-family:sans-serif;font-size:12px;color:#666;margin-bottom:20px}@media print{.dica{display:none}}</style></head><body><p class="dica">Use Ctrl+P e escolha "Salvar como PDF".</p><pre>${esc(textoContrato(c, false))}</pre><div class="ass"><pre>${esc(ass)}</pre></div><script>setTimeout(function(){window.print()},300)<\/script></body></html>`);
  w.document.close();
}

/* ---------- tela do responsável: assinatura ---------- */
const formA = document.getElementById('form-assinar');
function telaAssinar(tok) {
  const c = DB.contratos.find(x => x.token === tok), texto = document.getElementById('ass-texto'), ok = document.getElementById('ass-ok');
  formA.hidden = true; ok.hidden = true; formA.reset(); document.getElementById('erro-assinar').textContent = '';
  if (!c) { texto.textContent = 'Contrato não encontrado. Peça um novo link para a Tia Patrícia.'; return; }
  texto.innerHTML = textoContrato(c, true);
  if (c.status === 'assinado') { ok.hidden = false; ok.innerHTML = `<b>Contrato já assinado</b>Assinado por ${esc(c.assinatura.nome)} em ${fmtData(c.assinatura.em, true)}.`; return; }
  if (c.status !== 'aguardando') { texto.textContent = 'Este contrato não está disponível para assinatura.'; return; }
  let cod = sessionStorage.getItem('cod_' + tok); if (!cod) { cod = String(Math.floor(100000 + Math.random() * 900000)); sessionStorage.setItem('cod_' + tok, cod); }
  document.getElementById('ass-codigo').textContent = 'Demonstração: o código é ' + cod + '. No sistema real ele chega no e-mail ' + c.responsavel.email + '.';
  formA.dataset.token = tok; formA.hidden = false;
}
formA.addEventListener('submit', e => {
  e.preventDefault();
  const tok = formA.dataset.token, c = DB.contratos.find(x => x.token === tok), f = formA.elements, erro = document.getElementById('erro-assinar');
  if (!c) return;
  if (!f.aceite.checked) { erro.textContent = 'Marque que leu e concorda com o contrato.'; return; }
  if (!f.nome.value.trim()) { erro.textContent = 'Digite seu nome completo.'; return; }
  if (soDigitos(f.cpf.value).length !== 11) { erro.textContent = 'O CPF precisa ter 11 números.'; return; }
  if (f.codigo.value.trim() !== sessionStorage.getItem('cod_' + tok)) { erro.textContent = 'Código incorreto. Confira os 6 números.'; return; }
  c.status = 'assinado'; c.assinatura = { nome: f.nome.value.trim(), cpf: soDigitos(f.cpf.value), em: agora(), ip: '(gravado pelo servidor no sistema real)', hash: hashTexto(textoContrato(c, false)) };
  salvar(); formA.hidden = true;
  const ok = document.getElementById('ass-ok'); ok.hidden = false;
  ok.innerHTML = `<b>Contrato assinado</b>${esc(c.assinatura.nome)}, em ${fmtData(c.assinatura.em, true)}. Impressão digital do documento: ${c.assinatura.hash}. No sistema real, o PDF assinado chega no seu e-mail.`;
  toast('Assinatura registrada.');
});
document.getElementById('ass-voltar').addEventListener('click', () => { location.hash = '#contratos'; });

/* ---------- financeiro (prévia da fase 2) ---------- */
function renderFinanceiro() {
  const cs = DB.contratos.filter(c => c.status === 'assinado'), hoje = new Date();
  let recebido = 0, aberto = 0, atrasados = 0;
  const linhas = cs.map(c => {
    const cels = MESES.map((m, i) => { const pago = !!c.pagamentos[i + 1], venc = new Date(2027, i, c.vencimento), atr = !pago && venc < hoje; if (pago) recebido += c.mensalidade; else aberto += c.mensalidade; if (atr) atrasados++; return `<td><button class="mes ${pago ? 'pago' : atr ? 'atrasado' : ''}" data-id="${c.id}" data-m="${i + 1}" title="${m}">✓</button></td>`; }).join('');
    const pagos = Object.values(c.pagamentos).filter(Boolean).length;
    return `<tr><td>${esc(c.responsavel.nome)}<small>${esc(c.crianca.nome)} · ${esc(c.turma)} · ${fmtBRL(c.mensalidade)}</small></td>${cels}<td><b>${pagos}/12</b></td></tr>`;
  });
  document.getElementById('tab-fin').innerHTML = linhas.length ? linhas.join('') : '<tr><td colspan="14" class="vazio">Nenhum contrato assinado ainda. As mensalidades aparecem aqui depois da assinatura.</td></tr>';
  document.getElementById('fin-recebido').textContent = fmtBRL(recebido);
  document.getElementById('fin-aberto').textContent = fmtBRL(aberto);
  document.getElementById('fin-atrasados').textContent = atrasados;
}
document.getElementById('tab-fin').addEventListener('click', e => { const b = e.target.closest('button.mes'); if (!b) return; const c = achar(b.dataset.id); c.pagamentos[b.dataset.m] = !c.pagamentos[b.dataset.m]; salvar(); renderFinanceiro(); });

/* ---------- responsáveis ---------- */
function renderResponsaveis() {
  const porCPF = {};
  DB.contratos.forEach(c => { const k = c.responsavel.cpf; porCPF[k] = porCPF[k] || { r: c.responsavel, filhos: [], status: [] }; porCPF[k].filhos.push(c.crianca.nome); porCPF[k].status.push(c.status); });
  const lista = Object.values(porCPF);
  document.getElementById('tab-resp').innerHTML = lista.length ? lista.map(x => `<tr><td>${esc(x.r.nome)}<small>CPF ${fmtCPF(x.r.cpf)}</small></td><td>${esc(x.r.tel)}<small>${esc(x.r.email)}</small></td><td>${esc(x.filhos.join(', '))}</td><td>${x.status.map(s => `<span class="tag ${s}">${s}</span>`).join(' ')}</td></tr>`).join('') : '<tr><td colspan="4" class="vazio">Nenhum responsável cadastrado.</td></tr>';
}

/* ---------- início ---------- */
rota();