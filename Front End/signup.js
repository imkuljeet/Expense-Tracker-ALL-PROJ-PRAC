const errorDiv = document.getElementById('error-message');

async function signup(e) {
    e.preventDefault();

    const name = e.target.Name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    //--------------------------------------------------------------------------------------------------------

    const userDetails = { name, email, password };

    //--------------------------------------------------------------------------------------------------------

    try {
      const response = await await axios.post('http://localhost:3000/user/signup', userDetails);

      console.log('User signed up:', response.data);
      alert('Signup successful!');
      
      // window.location.href = './login.html'

    } catch (err) {
          // err.response exists if server replied with 4xx/5xx
        const serverMsg =
        err.response?.data?.message ||
        'Oops, something went wrong. Please try again.';

      // render inside the div
      errorDiv.textContent   = serverMsg;
      errorDiv.style.display = 'block';

      console.error('Signup failed:', err);
        
    }
}