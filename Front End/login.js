async function login(event) {
  event.preventDefault();

  const errDiv = document.getElementById('error-message');
  errDiv.hidden = true;
  errDiv.textContent = '';

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await axios.post('http://localhost:3000/user/login', {
      email,
      password
    });

    alert(res.data.message);

    // ✅ Save token to localStorage
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }

    // ✅ Redirect if needed
    // const next = res.data.redirect || '/dashboard.html';
    window.location.href = './expense.html';

  } catch (error) {
    const msg = error.response?.data?.message || 'Login failed.';
    errDiv.textContent = msg;
    errDiv.hidden = false;
  }
}
