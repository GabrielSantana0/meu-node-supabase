const tabela = document.getElementById('tabela-alunos');
const tabelaCursos = document.getElementById('tabela-cursos');
const msg = document.getElementById('msg');
const modal = document.getElementById('modal');
const modalTitulo = document.getElementById('modal-titulo');
const form = document.getElementById('form-aluno');
const inputNome = document.getElementById('nome');
const inputRa = document.getElementById('ra');
const selectCurso = document.getElementById('curso');
const filtroCurso = document.getElementById('filtro-curso');
const formCurso = document.getElementById('form-curso');
const inputNovoCurso = document.getElementById('novo-curso');

let modo = 'criar';
let raEditando = '';

function mostrarMsg(texto, tipo = '') {
  msg.hidden = false;
  msg.textContent = texto;
  msg.className = 'msg' + (tipo ? ` ${tipo}` : '');
}

async function listarCursos() {
  const resposta = await fetch('/cursos');
  const cursos = await resposta.json();
  if (!resposta.ok) {
    mostrarMsg(cursos.erro || 'Erro ao listar cursos', 'erro');
    return;
  }
  montarTabelaCursos(cursos);
  preencherSelects(cursos);
}

function montarTabelaCursos(cursos) {
  if (!cursos.length) {
    tabelaCursos.innerHTML =
      '<tr><td colspan="3" class="vazio">Nenhum curso cadastrado ainda.</td></tr>';
    return;
  }
  tabelaCursos.innerHTML = '';
  for (const curso of cursos) {
    const tr = document.createElement('tr');
    const tdNome = document.createElement('td');
    tdNome.textContent = curso.nome;
    const tdTotal = document.createElement('td');
    tdTotal.textContent = curso.total_alunos;
    const tdAcoes = document.createElement('td');
    tdAcoes.className = 'acoes';
    const btnVer = document.createElement('button');
    btnVer.textContent = 'Ver alunos';
    btnVer.className = 'btn btn-secundario btn-pequeno';
    btnVer.onclick = () => {
      filtroCurso.value = curso.id;
      listarAlunos();
    };
    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir';
    btnExcluir.className = 'btn btn-perigo btn-pequeno';
    btnExcluir.onclick = () => excluirCurso(curso.id, curso.nome);
    tdAcoes.appendChild(btnVer);
    tdAcoes.appendChild(btnExcluir);
    tr.appendChild(tdNome);
    tr.appendChild(tdTotal);
    tr.appendChild(tdAcoes);
    tabelaCursos.appendChild(tr);
  }
}

function preencherSelects(cursos) {
  const filtroAtual = filtroCurso.value;
  const cursoAtual = selectCurso.value;
  filtroCurso.innerHTML = '<option value="">Todos os cursos</option>';
  selectCurso.innerHTML = '<option value="">Selecione um curso</option>';
  for (const curso of cursos) {
    filtroCurso.appendChild(new Option(curso.nome, curso.id));
    selectCurso.appendChild(new Option(curso.nome, curso.id));
  }
  filtroCurso.value = filtroAtual;
  selectCurso.value = cursoAtual;
  if (filtroCurso.selectedIndex === -1) filtroCurso.value = '';
  if (selectCurso.selectedIndex === -1) selectCurso.value = '';
}

async function adicionarCurso(evento) {
  evento.preventDefault();
  const nome = inputNovoCurso.value.trim();
  const resposta = await fetch('/cursos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) {
    mostrarMsg(dados.erro || 'Erro ao cadastrar curso', 'erro');
    return;
  }
  inputNovoCurso.value = '';
  mostrarMsg(`Curso "${dados.nome}" cadastrado!`, 'ok');
  listarCursos();
}

async function excluirCurso(id, nome) {
  if (!confirm(`Excluir o curso "${nome}"?`)) return;
  const resposta = await fetch('/cursos/' + id, { method: 'DELETE' });
  const dados = await resposta.json();
  if (!resposta.ok) {
    mostrarMsg(dados.erro || 'Erro ao excluir curso', 'erro');
    return;
  }
  mostrarMsg('Curso excluído.', 'ok');
  atualizarTudo();
}

function abrirModalCriar() {
  if (selectCurso.options.length <= 1) {
    mostrarMsg('Cadastre um curso antes de incluir alunos.', 'erro');
    return;
  }
  modo = 'criar';
  raEditando = '';
  modalTitulo.textContent = 'Novo aluno';
  form.reset();
  selectCurso.value = filtroCurso.value;
  inputRa.disabled = false;
  modal.hidden = false;
  inputNome.focus();
}

function abrirModalEditar(aluno) {
  modo = 'editar';
  raEditando = aluno.ra;
  modalTitulo.textContent = 'Editar aluno';
  inputNome.value = aluno.nome || '';
  inputRa.value = aluno.ra || '';
  selectCurso.value = aluno.curso_id;
  inputRa.disabled = true;
  modal.hidden = false;
  inputNome.focus();
}

function fecharModal() {
  modal.hidden = true;
  form.reset();
  inputRa.disabled = false;
}

async function listarAlunos() {
  const cursoId = filtroCurso.value;
  const url = cursoId ? `/cursos/${cursoId}/alunos` : '/alunos';
  const resposta = await fetch(url);
  const alunos = await resposta.json();
  if (!resposta.ok) {
    mostrarMsg(alunos.erro || 'Erro ao listar alunos', 'erro');
    tabela.innerHTML = '...Não foi possível carregar a lista...';
    return;
  }
  if (!alunos.length) {
    tabela.innerHTML = '...Nenhum aluno encontrado...';
    return;
  }
  tabela.innerHTML = '';
  for (const aluno of alunos) {
    const tr = document.createElement('tr');
    const tdNome = document.createElement('td');
    tdNome.textContent = aluno.nome;
    const tdRa = document.createElement('td');
    tdRa.textContent = aluno.ra;
    const tdCurso = document.createElement('td');
    tdCurso.textContent = aluno.curso ? aluno.curso.nome : '—';
    const tdAcoes = document.createElement('td');
    tdAcoes.className = 'acoes';
    const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Editar';
    btnEditar.className = 'btn btn-secundario btn-pequeno';
    btnEditar.onclick = () => abrirModalEditar(aluno);
    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir';
    btnExcluir.className = 'btn btn-perigo btn-pequeno';
    btnExcluir.onclick = () => excluirAluno(aluno.ra, aluno.nome);
    tdAcoes.appendChild(btnEditar);
    tdAcoes.appendChild(btnExcluir);
    tr.appendChild(tdNome);
    tr.appendChild(tdRa);
    tr.appendChild(tdCurso);
    tr.appendChild(tdAcoes);
    tabela.appendChild(tr);
  }
}

async function salvarAluno(evento) {
  evento.preventDefault();
  const nome = inputNome.value.trim();
  const ra = inputRa.value.trim();
  const curso_id = Number(selectCurso.value);
  if (modo === 'criar') {
    const resposta = await fetch('/alunos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, ra, curso_id }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      mostrarMsg(dados.erro || 'Erro ao cadastrar', 'erro');
      return;
    }
    mostrarMsg('Aluno cadastrado com sucesso!', 'ok');
  } else {
    const resposta = await fetch('/alunos/' + encodeURIComponent(raEditando), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, curso_id }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      mostrarMsg(dados.erro || 'Erro ao atualizar', 'erro');
      return;
    }
    if (!dados || dados.length === 0) {
      mostrarMsg('RA não encontrado', 'erro');
      return;
    }
    mostrarMsg('Aluno atualizado com sucesso!', 'ok');
  }
  fecharModal();
  atualizarTudo();
}

async function excluirAluno(ra, nome) {
  if (!confirm(`Excluir o aluno "${nome}" (RA ${ra})?`)) return;
  const resposta = await fetch('/alunos/' + encodeURIComponent(ra), {
    method: 'DELETE',
  });
  const dados = await resposta.json();
  if (!resposta.ok) {
    mostrarMsg(dados.erro || 'Erro ao excluir', 'erro');
    return;
  }
  mostrarMsg('Aluno excluído.', 'ok');
  atualizarTudo();
}

async function atualizarTudo() {
  await listarCursos();
  await listarAlunos();
}

document.getElementById('btn-novo').addEventListener('click', abrirModalCriar);
document.getElementById('btn-atualizar').addEventListener('click', atualizarTudo);
document.getElementById('btn-cancelar').addEventListener('click', fecharModal);
document.getElementById('modal-fundo').addEventListener('click', fecharModal);
form.addEventListener('submit', salvarAluno);
formCurso.addEventListener('submit', adicionarCurso);
filtroCurso.addEventListener('change', listarAlunos);
atualizarTudo();
