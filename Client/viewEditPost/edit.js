if (document.getElementById("heading").innerHTML.trim() == "") {
    document.getElementById("heading").innerHTML =
        "Just Write. Your article title goes here... Press enter to type the body."; // default text
} else {
    document.getElementById("heading").innerHTML =
        localStorage["title"];
};

if (document.getElementById("content").innerHTML.trim() == "") {
    document.getElementById("content").innerHTML =
        "This text is automatically saved every second :) "; //default text
} else {
    document.getElementById("content").innerHTML =
        localStorage["text"];
    dynamicMessage("Going good...");
};

// default text

console.log("started")

setInterval(function () {
    // fuction that is saving the innerHTML of the div
    localStorage["title"] = document.getElementById("heading").innerHTML; // heading div
    localStorage["text"] = document.getElementById("content").innerHTML; // content div
}, 1000);

const backendServerPostEssay = "http://localhost:5002/login";
const messageTag = document.getElementById("message");

//Post the essay
const postButton = document.getElementById("post");
postButton.addEventListener("click", (event) => {
    event.preventDefault();

    var allImgLinks = [];
    var allMediaLinks = []

    var imglinks = document.getElementsByTagName('img');
    for (var i = 0; i < imglinks.length; i++) {
        var thisLink = imglinks[i];
        var imgSource = thisLink.getAttribute('href');
        allImgLinks.push(imgSource.trim());
    }

    var medialinks = document.getElementsByTagName('media');
    for (var i = 0; i < medialinks.length; i++) {
        var thisLink = medialinks[i];
        var mediaSource = thisLink.getAttribute('href');
        allMediaLinks.push(mediaSource.trim());
    }

    const postObject = {
        "title": document.getElementById("heading").innerHTML.trim(),
        "content": document.getElementById("content").innerHTML.trim(),
        "images": allImgLinks,
        "media": allMediaLinks
    };

    console.log(postObject)

    var pingback = "";

    console.log(pingback)

    fetch(backendServerPostEssay, {
        method: "POST",
        body: JSON.stringify(postObject),
        headers: {
            "content-type": "application/JSON"
        }
    }).then((Response) => {
        data = Response.json();
        return data;
    }).then(data => {
        pingback = data.text;
    });

    console.log(pingback);

    this.removeTag();

    if (pingback.toString().toLowerCase().includes("posted")) {
        this.dynamicMessage("Article Posted!")
    } else {
        this.dynamicMessage("Error :( Retry posting again.");
    }
});


//Insert image
const postButton = document.getElementById("new_image");
postButton.addEventListener("click", (event) => {
    clickCount += 1;

    if (clickCount > 50) {
        postButton.removeEventListener("click", arguments.callee, false);
    };

    console.log("clicked");
    event.preventDefault();

    var allImgLinks = [];
    var allMediaLinks = []

    var imglinks = document.getElementsByTagName('img');
    for (var i = 0; i < imglinks.length; i++) {
        var thisLink = imglinks[i];
        var imgSource = thisLink.getAttribute('href');
        allImgLinks.push(imgSource.trim());
    }

    var medialinks = document.getElementsByTagName('media');
    for (var i = 0; i < medialinks.length; i++) {
        var thisLink = medialinks[i];
        var mediaSource = thisLink.getAttribute('href');
        allMediaLinks.push(mediaSource.trim());
    }

    const postObject = {
        "title": document.getElementById("heading").innerHTML.trim(),
        "content": document.getElementById("content").innerHTML.trim(),
        "images": allImgLinks,
        "media": allMediaLinks
    };

    console.log(postObject)

    var pingback = "";

    console.log(pingback)

    fetch(backendServerPostEssay, {
        method: "POST",
        body: JSON.stringify(postObject),
        headers: {
            "content-type": "application/JSON"
        }
    }).then((Response) => {
        data = Response.json();
        return data;
    }).then(data => {
        pingback = data.text;
    });

    console.log(pingback);

    this.removeTag();

    if (pingback.toString().toLowerCase().includes("posted")) {
        this.dynamicMessage("Article Posted!")
    } else {
        this.dynamicMessage("Error :( Retry posting again.");
    }
});



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