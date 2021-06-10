const express = require('express');
const cors = require('cors');
const app = express();
const crypto = require('crypto');

const auth = require('./lib/auth');

const apiRoute = require('./routes/api');

const port = 3000;

app.use(cors());
app.use('/api/v1', apiRoute);


crypto.randomBytes(16, function(err, buffer) {
    auth.setAPIKey("", buffer.toString('hex'));
    console.log("=====================================");
    console.log("New API Key:");
    console.log(buffer.toString('hex'));
    console.log("=====================================");
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/html/index.html');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});