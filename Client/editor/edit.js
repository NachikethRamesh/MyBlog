const backendServerPostEssay = "http://localhost:5002/newpost";
const messageTag = document.getElementById('message');

const container = document.getElementById('editor');

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],

    // toggled buttons
    ['blockquote', 'code-block', 'image', 'video', 'link'],

    // custom button values
    [{
        'list': 'ordered'
    }, {
        'list': 'bullet'
    }],

    [{
        'script': 'sub'
    }, {
        'script': 'super'
    }],

    // superscript/subscript
    [{
        'direction': 'rtl'
    }],

    // text direction
    [{
        'size': ['small', false, 'large', 'huge']
    }],

    // custom dropdown
    [{
        'header': [1, 2, 3, 4, 5, 6, false]
    }],

    [{
        'color': []
    }, {
        'background': []
    }],

    // dropdown with defaults from theme
    [{
        'font': ['Times New Roman']
    }],

    [{
        'align': []
    }],

    // remove formatting button
    ['clean']
];

const options = {
    debug: 'info',
    modules: {
        toolbar: toolbarOptions
    },
    placeholder: 'Let your imaginations run wild...',
    readOnly: false,
    theme: 'snow',
};

var editor = new Quill(container, options);

//env
const htmlSetBody = '<!DOCTYPE html> <html lang="en">  <head>     <meta charset="UTF-8">     <meta name="viewport" content="width=device-width, initial-scale=1.0">     <meta http-equiv="X-UA-Compatible" content="ie=edge">     <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"         integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">     <link rel="stylesheet" href="../styles.css">     <link rel="stylesheet" href="../bootstrap.min.css">     <title>Document</title> </head>  <body class="bg">     <main>         <nav class="navbar navbar-expand-lg navbar-dark bg-primary">             <a class="navbar-brand" href="../index.html">Nachiketh Ramesh</a>             <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapsibleNavbar">                 <span class="navbar-toggler-icon"></span>             </button>             <div class="navbar-collapse navbar-alt" id="navbarNavAltMarkup">                 <div class="navbar-nav">                     <a class="nav-item nav-link" id="home" href="../index.html">Home </a>                     <a class="nav-item nav-link" id="about" href="/Client/viewAbout/about.html">About</a>                 </div>             </div>         </nav>           <body>             <div id="articleBody" class="h1Container">              </div>          </body>          <section id="footer">             <div class="container">                 <div class="row">                     <div class="col-xs-12 col-sm-12 col-md-12 mt-2 mt-sm-2 text-center text-white">                         <p>I do not own the rights to the background image used in this website. I have used it as per                             the <u><a href="https://creativecommons.org/licenses/by-nd/4.0/">CC-BY-ND</a></u>                             norms. Image source: <u><a                                     href="https://bryanmmathers.com/perspective/">bryanmmathers.com</a></u></p>                         <p class="h6">&copy All right Reversed.<a class="text-green ml-2" target="_blank">Nachiketh                                 Ramesh</a></p>                     </div>                     </hr>                 </div>             </div>         </section>         <script src=" / Client / viewFullPost / full.js "></script>     </main> </body>  <script src="//maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script> <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>  </html>';

//Post the essay
const postButton = document.getElementById("submitButton");
postButton.addEventListener("click", (event) => {
    event.preventDefault();

    const postObject = {
        "content": editor.container.firstChild.innerHTML
    };

    sendData(postObject);
});

async function sendData(dataObject) {
    let response = await fetch(backendServerPostEssay, {
        method: "POST",
        body: JSON.stringify(dataObject),
        headers: {
            "content-type": "application/JSON"
        }
    });

    let json = await response.json();

    let pingback = json.message;

    this.removeTag();

    if (pingback.toString().toLowerCase().includes("posted")) {
        this.dynamicMessage("Article Posted! You may close the page. User will be logged out automatically.");
        window.location.href = '/Client/viewAbout/about.html'
    } else {
        this.dynamicMessage("Error :( Retry posting again.");
    };
};

function removeTag() {
    if (document.getElementById("tempMessage") != null && document.getElementById("tempMessage") != undefined) {
        document.getElementById("tempMessage").remove();
    };
};

function dynamicMessage(textMessage) {
    const pTag = document.createElement("p");
    pTag.setAttribute("id", "tempMessage");
    pTag.textContent = textMessage;
    messageTag.appendChild(pTag);
};