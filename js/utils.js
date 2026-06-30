function showToast(message) {
  const box = document.getElementById('toast-box');
  const div = document.createElement('div');
  div.className = 'toast';
  div.textContent = message;
  box.appendChild(div);

  setTimeout(() => div.remove(), 3000);
}

function switchSection(id) {
  document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}