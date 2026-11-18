let mode = 'login';
const $ = (id) => document.getElementById(id);

if (localStorage.getItem('token')) location.href = 'builder.html';

function setMode(m) {
  mode = m;
  $('tabLogin').classList.toggle('active', m === 'login');
  $('tabRegister').classList.toggle('active', m === 'register');
  $('name').classList.toggle('hidden', m === 'login');
  $('submitBtn').textContent = m === 'login' ? 'Login' : 'Create account';
}
$('tabLogin').onclick = () => setMode('login');
$('tabRegister').onclick = () => setMode('register');

$('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = { email: $('email').value, password: $('password').value };
  if (mode === 'register') body.name = $('name').value;
  try {
    const res = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem('token', data.token);
    localStorage.setItem('name', data.name);
    location.href = 'builder.html';
  } catch (err) {
    $('msg').textContent = err.message;
  }
});
