const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

//--------------------------------------------------------------------------------------------------------

const app = express();

//--------------------------------------------------------------------------------------------------------

app.use(bodyParser.json());
app.use(cors());

//--------------------------------------------------------------------------------------------------------

app.post('/user/signup', (req, res) => {
    const { name, email, password } = req.body;

    console.log('Received user data:', { name, email, password });


});

//--------------------------------------------------------------------------------------------------------

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
