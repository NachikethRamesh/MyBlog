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
        this.dynamicMessage("Article Posted! You may close the page.");
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