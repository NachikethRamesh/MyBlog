const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const monk = require('monk');
const crypto = require('crypto');
const cookieSession = require('cookie-session');
const fs = require('fs');
const path = require('path');

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

//New post added
app.post('/newpost', (req, res) => {
    console.log("newpost api")
    const db = monk(url);

    var title = beforeAfter(">", "</", req.body.content.toString()).trim();
    console.log(title)
    if (title.includes('<') || title.includes('>')) {
        title = beforeAfter(">", "", title.toString()).trim();
    }
    console.log(title)
    if (title.includes('<') || title.includes('>')) {
        title = beforeAfter("", "<", title.toString()).trim();
    }
    console.log(title)
    var link = title.split(' ').join('_');
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

                    const filePath = './views' + link;
                    console.log(filePath);
                    createHTMLFile(req.body.content, filePath, title)
                        .then(() => {
                            console.log("file created")
                            var resolvedPath = path.resolve(filePath);
                            console.log(resolvedPath)
                            res.render(resolvedPath, (err) => {
                                if (err) {
                                    Promise.reject(err);
                                    res.status(400);
                                    res.end(JSON.stringify({
                                        message: "error",
                                        link: "error"
                                    }));
                                } else {
                                    Promise.resolve("posted");
                                    res.status(200);
                                    res.end(JSON.stringify({
                                        message: "posted",
                                        link: link
                                    }));
                                }
                            })
                        })
                        .catch((err) => {
                            Promise.reject(err);
                            res.status(400);
                            res.end(JSON.stringify({
                                message: "error",
                                link: "error"
                            }));
                        });

                })
                .catch((err) => {
                    Promise.reject(err);
                    res.status(400);
                    res.end(JSON.stringify({
                        message: "error",
                        link: "error"
                    }));
                })
        })
        .catch((err) => {
            db.close();
            Promise.reject(err);
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

//full page
app.post('/full', (req, res) => {
    const db = monk(url);

    console.log('full page api')

    var searchObject = {
        link: link
    };

    var content = "";
    var htmlContent = "";

    db.then(() => {
            console.log('Connected correctly to db server');

            const articleCollection = db.get('Articles');
            console.log("collection opened");

            articleCollection.findOne(searchObject)
                .then((result) => {
                    console.log("article found");
                    content = result.content;
                    htmlContent = generatePage(content);
                    return htmlContent;
                })
                .then((htmlContent) => {
                    db.close();
                    res.writeHead(200, {
                        'Content-Type': 'text/html',
                        'Content-Length': htmlContent
                    });
                    res.end(html);
                })
                .catch((err) => {
                    db.close();
                    Promise.reject(err);
                })
        })
        .catch((err) => {
            Promise.reject(err);
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
            <div id = "articleBody" class = "h1ContainerFullPosts">
                <div id = "hereGoesTheBodyFor${title}">
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