const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const monk = require('monk');
const crypto = require('crypto');
const cookieSession = require('cookie-session');

dotenv.config();

const app = express();

app.set('views', __dirname + '\\views\\');
app.set('views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//Morgan is used for logging
app.use(morgan('tiny'));

//Cors allows cross origin requests
app.use(cors());

//Body parser parses the data received from client
app.use(bodyParser.json());

const secret = 'r@mesh' //env
app.use(cookieSession({
    name: 'session',
    keys: [secret],
}));

const pass = 'n@ch!k'; //env
const algorithm = 'aes-192-cbc'; //env

createCipher = (pass, algorithm) => {
    return new Promise(resolve => {
        const key = crypto.scryptSync(pass, 'salt', 24);
        const iv = Buffer.alloc(16, 0);
        cipher = crypto.createCipheriv(algorithm, key, iv);
        resolve(cipher);
    });
};

// For this one, your own promise makes sense
encryptTextAsPromise = (cipher, enteredPassword) => {
    return new Promise(resolve => {
        let cipherText = '';
        cipher.on('readable', () => {
            var data = cipher.read();
            if (data)
                cipherText += data.toString('hex');
        });
        cipher.on('end', () => {
            resolve(cipherText);
        });
        cipher.write(enteredPassword);
        cipher.end();
    });
};

// Connection URL - put env variable
const url = 'mongodb+srv://MyBlog:Satanspeak123@pagecluster-v39xp.mongodb.net/MyBlogMainDB?retryWrites=true&w=majority';

app.get('/', (req, res) => {
    res.json({
        message: 'Connected'
    })
});

app.get('/login', (req, res) => {
    res.json({
        message: 'login part'
    })
});

//New post added
app.post('/newpost', (req, res) => {
    const db = monk(url);
    var title = beforeAfter(">", "</", req.body.content.toString()).trim();
    var link = title.replace(' ', '_');
    link = '/' + link + '.html';

    db.then(() => {
            console.log('Connected correctly to db server');
            var insertObject = {
                title: title,
                content: req.body.content,
                link: link
            };

            const articleCollection = db.get('Articles');
            console.log("collection opened");

            articleCollection.insert(insertObject)
                .then(() => console.log("data inseterd"))
                .then(() => {
                    req.session = null;
                    db.close();
                    res.status(200);
                    res.end(JSON.stringify({
                        message: "posted",
                        link: link
                    }))
                })
                .catch((err) => {
                    db.close();
                    Promise.reject(err);
                    res.status(400);
                    res.end(JSON.stringify({
                        message: "error",
                        link: "error"
                    }))
                })
        })
        .catch((err) => {
            Promise.reject(err);
            res.status(400);
            res.end(JSON.stringify({
                message: "error",
                link: "error"
            }))
        });
});

//login request handler
app.post('/login', (req, res) => {
    const db = monk(url);
    const password = req.body.password.toString().trim();

    console.log(password)

    var verifObject = {
        email: req.body.email,
    };

    db.then(() => {
            console.log('Connected correctly to db server');

            const articleCollection = db.get('VerifColl');
            console.log("collection opened");

            articleCollection.findOne(verifObject)
                .then((result) => {
                    console.log("data fetched");
                    db.close();
                    if (result != null || result != undefined) {
                        const savedPasskey = result.encryptedpassword.toString().trim();
                        var encryptedPasskey = '';
                        createCipher(pass, algorithm)
                            .then(data => encryptTextAsPromise(data, password))
                            .then(data => {
                                encryptedPasskey = data;
                                if (encryptedPasskey == savedPasskey) {
                                    res.status(400);
                                    res.end(JSON.stringify({
                                        message: "granted"
                                    }));
                                    Promise.resolve("granted");
                                } else {
                                    res.status(400);
                                    res.end(JSON.stringify({
                                        message: "error"
                                    }));
                                };
                            })
                            .catch((err) => {
                                Promise.reject(err);
                                res.status(400);
                                res.end(JSON.stringify({
                                    message: "error"
                                }));
                            });
                    } else {
                        res.status(400);
                        res.end(JSON.stringify({
                            message: "error"
                        }));
                    }
                })
                .catch((err) => {
                    db.close();
                    Promise.reject(err);
                    res.status(400);
                    res.end(JSON.stringify({
                        message: "error"
                    }));
                });
        })
        .catch((err) => {
            Promise.reject(err);
            res.status(400);
            res.end(JSON.stringify({
                message: "error"
            }));
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
                .then((result) => {
                    console.log(result);
                    db.close();
                    res.status(200);
                    res.end(JSON.stringify({
                        title: result.title,
                        link: result.link
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