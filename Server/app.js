const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();

//Morgan is used for logging
app.use(morgan('tiny'));

//Cors allows cross origin requests
app.use(cors());

//Body parser parses the data received from client
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({
        message: "Connected"
    })
});

//Start server on a port
const port = process.env.PORT || 5001;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});