const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const monk = require('monk');

dotenv.config();

const app = express();

// Connection URL
const url = 'mongodb+srv://MyBlog:Satanspeak123@pagecluster-v39xp.mongodb.net/MyBlogMainDB?retryWrites=true&w=majority';

//Morgan is used for logging
app.use(morgan('tiny'));

//Cors allows cross origin requests
app.use(cors());

//Body parser parses the data received from client
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Connected'
    })
});

//New post added
app.post('/newpost', (req, res) => {
    const db = monk(url);
    var title = beforeAfter(">", "</", req.body.content.toString())

    db.then(() => {
            console.log('Connected correctly to db server');
            var insertObject = {
                title: title,
                content: req.body.content
            };

            const articleCollection = db.get('Articles');
            console.log("collection opened");

            articleCollection.insert(insertObject)
                .then(() => console.log("data inseterd"))
                .then(() => {
                    db.close();
                    addNewPage(title);
                    res.status(200);
                    res.end(JSON.stringify({
                        message: "posted"
                    }))
                })
                .catch((err) => {
                    db.close();
                    Promise.reject(err);
                    res.status(400);
                    res.end(JSON.stringify({
                        message: "error"
                    }))
                })
        })
        .catch((err) => {
            Promise.reject(err);
            res.status(400);
            res.end(JSON.stringify({
                message: "error"
            }))
        });
});

//login request handler
app.post('/login', (req, res) => {
    const db = monk(url);

    var verifObject = {
        title: title.trim(),
    };

    db.then(() => {
            console.log('Connected correctly to db server');

            const articleCollection = db.get('Articles');
            console.log("collection opened");

            articleCollection.insert(insertObject)
                .then(() => console.log("data inseterd"))
                .then(() => {
                    db.close();
                    addNewPage(title);
                    res.status(200);
                    res.end(JSON.stringify({
                        message: "posted"
                    }))
                })
                .catch((err) => {
                    db.close();
                    Promise.reject(err);
                    res.status(400);
                    res.end(JSON.stringify({
                        message: "error"
                    }))
                })
        })
        .catch((err) => {
            Promise.reject(err);
            res.status(400);
            res.end(JSON.stringify({
                message: "error"
            }))
        });
});

//main page handler
app.post('/main', (req, res) => {
    const db = monk(url);

    db.then(() => {
            console.log('Connected correctly to db server');

            const articleCollection = db.get('Articles');
            console.log("collection opened");

            articleCollection.find()
                .then(() => console.log("fetched all"))
                .then(() => {
                    db.close();
                    res.status(200);
                    res.end(JSON.stringify({
                        //put response
                    }))
                })
                .catch((err) => {
                    db.close();
                    Promise.reject(err);
                    res.status(400);
                    res.render('error');
                })
        })
        .catch((err) => {
            Promise.reject(err);
            res.status(400);
            res.render('error');
        });
});

//Start server on a port
//const port = process.env.PORT || 5002;
const port = 5002;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});

function beforeAfter(before, after, input) {
    input = input.substring(0);
    let firstIndex = input.indexOf(before) + 1;
    let secondIndex = input.indexOf(after);
    var outputString = input.substring(firstIndex, secondIndex);
    return outputString;
};

function addNewPage(title) {
    const db = monk(url);

    var content = "";

    db.then(() => {
            console.log('Connected correctly to db server');
            var searchObject = {
                title: title.trim(),
            };

            const articleCollection = db.get('Articles');
            console.log("collection opened");

            articleCollection.findOne(searchObject)
                .then((result) => {
                    console.log("article found");
                    attachTagsToNewPage(result.content);
                })
                .then(() => {
                    db.close();
                })
                .catch((err) => {
                    db.close();
                    Promise.reject(err);
                })
        })
        .catch((err) => {
            Promise.reject(err);
        });
};

function attachTagsToNewPage(contents) {
    console.log(contents);
};