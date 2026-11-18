const token = localStorage.getItem('token');
if (!token) location.href = 'index.html';

const $ = (id) => document.getElementById(id);
const fields = ['fullName', 'email', 'phone', 'address', 'summary', 'skills'];

// Row templates for repeatable sections
const sections = {
  education: ['degree', 'school', 'year'],
  experience: ['role', 'company', 'duration', 'details'],
  projects: ['title', 'details'],
};

const esc = (s = '') =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function addRow(section, values = {}) {
  const row = document.createElement('div');
  row.className = 'row';
  sections[section].forEach((key) => {
    const el = document.createElement(key === 'details' ? 'textarea' : 'input');
    el.placeholder = key[0].toUpperCase() + key.slice(1);
    el.dataset.key = key;
    el.value = values[key] || '';
    el.addEventListener('input', render);
    row.appendChild(el);
  });
  const del = document.createElement('button');
  del.textContent = 'Remove';
  del.className = 'ghost';
  del.onclick = () => { row.remove(); render(); };
  row.appendChild(del);
  $(section).appendChild(row);
}

function readRows(section) {
  return [...$(section).children].map((row) => {
    const obj = {};
    row.querySelectorAll('[data-key]').forEach((el) => (obj[el.dataset.key] = el.value));
    return obj;
  });
}

function getData() {
  const data = {};
  fields.forEach((f) => (data[f] = $(f).value));
  data.skills = $('skills').value.split(',').map((s) => s.trim()).filter(Boolean);
  Object.keys(sections).forEach((s) => (data[s] = readRows(s)));
  return data;
}

function render() {
  const d = getData();
  $('preview').innerHTML = `
    <h1>${esc(d.fullName) || 'Your Name'}</h1>
    <p class="contact">${[d.email, d.phone, d.address].filter(Boolean).map(esc).join(' | ')}</p>
    ${d.summary ? `<h4>Summary</h4><p>${esc(d.summary)}</p>` : ''}
    ${d.skills.length ? `<h4>Skills</h4><p>${d.skills.map(esc).join(' • ')}</p>` : ''}
    ${d.education.length ? `<h4>Education</h4>` + d.education.map((e) =>
      `<p><b>${esc(e.degree)}</b> — ${esc(e.school)} <span>${esc(e.year)}</span></p>`).join('') : ''}
    ${d.experience.length ? `<h4>Experience</h4>` + d.experience.map((e) =>
      `<p><b>${esc(e.role)}</b>, ${esc(e.company)} <span>${esc(e.duration)}</span><br>${esc(e.details)}</p>`).join('') : ''}
    ${d.projects.length ? `<h4>Projects</h4>` + d.projects.map((p) =>
      `<p><b>${esc(p.title)}</b><br>${esc(p.details)}</p>`).join('') : ''}`;
}

async function load() {
  const res = await fetch('/api/resume', { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) return logout();
  const d = await res.json();
  fields.forEach((f) => {
    $(f).value = f === 'skills' ? (d.skills || []).join(', ') : d[f] || '';
  });
  Object.keys(sections).forEach((s) => (d[s] || []).forEach((v) => addRow(s, v)));
  render();
}

async function save() {
  const res = await fetch('/api/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(getData()),
  });
  $('status').textContent = res.ok ? 'Saved ✔' : 'Save failed';
}

function logout() {
  localStorage.clear();
  location.href = 'index.html';
}

fields.forEach((f) => $(f).addEventListener('input', render));
document.querySelectorAll('[data-add]').forEach((b) =>
  b.addEventListener('click', () => addRow(b.dataset.add)));
$('saveBtn').onclick = save;
$('printBtn').onclick = () => window.print();
$('logoutBtn').onclick = logout;
load();
