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
      
    } catch (err) {
      console.error('Signup failed:', err);
     
    }
}