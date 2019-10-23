const backendServerPostEssay = "http://localhost:5002/newpost";
const messageTag = document.getElementById('message');

var editor = new wysihtml5.Editor('editor', {
    toolbar: 'toolbar',
    parserRules: wysihtml5ParserRules // defined in file parser rules javascript
});
editor.focus()

//Post the essay
const postButton = document.getElementById("submitButton");
postButton.addEventListener("click", (event) => {
    event.preventDefault();

    editor.disable();

    const postObject = {
        // "content": editor.container.firstChild.innerHTML
        "content": editor.getValue()
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
    let link = json.link;
    link = '/server/views' + link;

    removeTag();

    if (pingback.toString().toLowerCase().includes("posted")) {
        window.location.href = link;
    } else {
        dynamicMessage("Error :( Retry posting again.");
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