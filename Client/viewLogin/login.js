const backendServerLogin = "http://localhost:5002/login";
const backendServerPostEssay = "http://localhost:5002/newpost";

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginMessageTag = document.getElementById('loginMessage');

const postButton = document.getElementById("submitButton");
postButton.addEventListener("click", (event) => {
    event.preventDefault();

    removeTag()

    var email = emailInput.value.toString().trim();
    var password = passwordInput.value.toString().trim();

    if (password == "" || email == "") {
        removeTag();

        dynamicMessage("Enter a valid email ID and non empty password");
    } else {
        const postObject = {
            email: email,
            password: password
        };

        sendLoginData(postObject);
    };
});

async function sendLoginData(dataObject) {
    let response = await fetch(backendServerLogin, {
        method: "POST",
        body: JSON.stringify(dataObject),
        headers: {
            "content-type": "application/JSON"
        }
    });

    let json = await response.json();

    let pingback = json.message;

    this.removeTag();

    if (pingback.toString().toLowerCase().includes("error")) {
        this.dynamicMessage("Access denied");
    } else {
        let response = await fetch(backendServerPostEssay, {
            method: "GET",
            headers: {
                "content-type": "application/JSON"
            }
        });

        let json = await response.json();

        let pingback = json.message;
        let link = json.link;
        link = '/server/views' + link;

        window.location.href = link;
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
    loginMessageTag.appendChild(pTag);
};