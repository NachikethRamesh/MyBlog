const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const monk = require('monk');
const crypto = require('crypto');
const randomstring = require("randomstring");
const cookieSession = require('cookie-session');
const fs = require('fs');
const path = require('path');

dotenv.config();
const app = express();

//Set views folder
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

const secret = process.env.SESS_SECR
app.use(cookieSession({
    name: 'session',
    keys: [secret],
}));

//Create a cipher
const pass = process.env.CRY_PASSKEY;
const algorithm = process.env.CRY_ALGO;
createCipher = (pass, algorithm) => {
    return new Promise(resolve => {
        const key = crypto.scryptSync(pass, 'salt', 24);
        const iv = Buffer.alloc(16, 0);
        cipher = crypto.createCipheriv(algorithm, key, iv);
        resolve(cipher);
    });
};

//Encrypt incoming password
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

//connection url for mongo db
const url = process.env.MDB_URI;

app.get('/', (req, res) => {
    res.json({
        message: 'frontend and backend connected'
    })
});

app.get('/newpost', (req, res) => {
    const link = '/edit.html'
    const editHTMLPath = path.resolve('./views/edit.html');
    res.render(editHTMLPath, (err) => {
        if (err) {
            res.render(path.resolve('./views/error.html'), () => {
                // Promise.reject(err);
                res.status(400);
                res.end(JSON.stringify({
                    message: "error",
                    link: "/error.html"
                }));
            })
        } else {
            // Promise.resolve("posted");
            res.status(200);
            res.end(JSON.stringify({
                message: "page sent",
                link: link
            }));
        }
    });
});

//New post added
app.post('/newpost', (req, res) => {
    var link = randomstring.generate(25);
    link = link.trim();
    link = '/' + link + '.html';

    var content = req.body.content;

    var title = beforeAfter('>', '</', content);
    while (title.includes('>') || title.includes('<')) {
        if (title.includes('<') || title.includes('>')) {
            title = beforeAfter(">", "", title.toString()).trim();
        }

        if (title.includes('<') || title.includes('>')) {
            title = beforeAfter("", "<", title.toString()).trim();
        }
    };

    const db = monk(url);
    db.then(() => {
            var insertObject = {
                link: link,
                title: title,
                content: content
            };

            const articleCollection = db.get('Articles');

            articleCollection.insert(insertObject)
                .then(() => {
                    req.session = null;
                    db.close();

                    const filePath = './views' + link;
                    createHTMLFile(content, filePath, title)
                        .then(() => {
                            var resolvedPath = path.resolve(filePath);
                            res.render(resolvedPath, err => {
                                if (err) {
                                    // Promise.reject(err);
                                    res.status(400);
                                    res.end(JSON.stringify({
                                        message: "error",
                                        link: "error"
                                    }));
                                } else {
                                    // Promise.resolve("posted");
                                    res.status(200);
                                    res.end(JSON.stringify({
                                        message: "posted",
                                        link: link
                                    }));
                                }
                            })
                        })
                        .catch(() => {
                            // Promise.reject(err);
                            res.status(400);
                            res.end(JSON.stringify({
                                message: "error",
                                link: "error"
                            }));
                        });

                })
                .catch(() => {
                    // Promise.reject(err);
                    res.status(400);
                    res.end(JSON.stringify({
                        message: "error",
                        link: "error"
                    }));
                })
        })
        .catch(() => {
            db.close();
            // Promise.reject(err);
            res.status(400);
            res.end(JSON.stringify({
                message: "error",
                link: "error"
            }));
        })
});

//login request handler
app.post('/login', (req, res) => {
    const db = monk(url);
    const password = req.body.password.toString().trim();

    var verifObject = {
        email: req.body.email,
    };

    db.then(() => {
            const articleCollection = db.get('VerifColl');
            articleCollection.findOne(verifObject)
                .then((result) => {
                    db.close();
                    if (result != null || result != undefined) {
                        const savedPasskey = result.encryptedpassword.toString().trim();
                        var encryptedPasskey = '';
                        createCipher(pass, algorithm)
                            .then(data => encryptTextAsPromise(data, password))
                            .then(data => {
                                encryptedPasskey = data;
                                if (encryptedPasskey == savedPasskey) {
                                    res.status(200);
                                    res.end(JSON.stringify({
                                        message: "granted"
                                    }));
                                    // Promise.resolve("granted");
                                } else {
                                    res.status(400);
                                    res.end(JSON.stringify({
                                        message: "error"
                                    }));
                                };
                            })
                            .catch(() => {
                                // Promise.reject(err);
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
                .catch(() => {
                    db.close();
                    // Promise.reject(err);
                    res.status(400);
                    res.end(JSON.stringify({
                        message: "error"
                    }));
                });
        })
        .catch(() => {
            // Promise.reject(err);
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
            //console.log('Connected correctly to db server');

            const articleCollection = db.get('Articles');
            //console.log("collection opened");

            articleCollection.find()
                .then((result) => {
                    //console.log("fetched all")
                    //console.log(JSON.stringify(result));
                    db.close();
                    res.status(200);
                    res.end(JSON.stringify({
                        result: result
                    }));
                })
                .catch((err) => {
                    db.close();
                    Promise.reject(err);
                    res.status(400);
                    res.end(JSON.stringify({
                        result: "error"
                    }));
                })
        })
        .catch((err) => {
            Promise.reject(err);
            res.status(400);
            res.render(JSON.stringify({
                result: "error"
            }));
        });
});

//Start server on a port
const port = process.env.PORT || 5002;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});

function beforeAfter(before, after, input) {
    input = input.substring(0);
    let firstIndex = input.indexOf(before) + 1;
    let secondIndex = input.indexOf(after);
    var outputString = "";
    if (before == "") {
        outputString = input.substring(0, secondIndex);
    } else if (after == "") {
        outputString = input.substring(firstIndex);
    } else {
        outputString = input.substring(firstIndex, secondIndex);
    }
    return outputString;
};

function generatePage(content, title) {
    var htmlBody = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <link rel="stylesheet" href="/Client/styles.css">
    <link rel="stylesheet" href="/Client/bootstrap.min.css">
    <title>${title}</title>
</head>

<body class="bg">
    <main>
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <a class="navbar-brand" href="/Client/index.html">Nachiketh Ramesh</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapsibleNavbar">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="navbar-collapse navbar-alt" id="navbarNavAltMarkup">
                <div class="navbar-nav">
                    <a class="nav-item nav-link" id="home" href="/Client/index.html">Home </a>
                    <a class="nav-item nav-link" id="about" href="/Client/viewAbout/about.html">About</a>
                    <a class="nav-item nav-link" id="login" href="/Client/viewLogin/login.html">Login</a>
                </div>
            </div>
        </nav>


        <body>
            <div id = "articleBody" class = "h1Container">
                <div id = "hereGoesTheBodyFor${title}" class = "textfeatures">
                    ${content}
                </div>
            </div>

        </body>

        <section id="footer">
            <div class="container">
                <div class="row">
                    <div class="col-xs-12 col-sm-12 col-md-12 mt-2 mt-sm-2 text-center text-white">
                        <p>I do not own the rights to the background image used in this website. I have used it as per
                            the <u><a href="https://creativecommons.org/licenses/by-nd/4.0/">CC-BY-ND</a></u>
                            norms. Image source: <u><a
                                    href="https://bryanmmathers.com/perspective/">bryanmmathers.com</a></u></p>
                        <p class="h6">&copy All right Reversed.<a class="text-green ml-2" target="_blank">Nachiketh
                                Ramesh</a></p>
                    </div>
                    </hr>
                </div>
            </div>
        </section>
        <script src='/Client/viewFullPost/full.js'></script>
    </main>
</body>

<script src="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>

</html>`;

    return htmlBody.toString();
};

async function createHTMLFile(content, filePath, title) {
    var htmlContent = generatePage(content, title);
    var htmlFile = fs.createWriteStream(filePath);
    await htmlFile.write(htmlContent, {
        encoding: 'utf8'
    });
    htmlFile.end();
};