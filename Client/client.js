const backendServerShowAllTitles = 'http://localhost:5002/main';
const allPostsTag = document.getElementById('allPosts');

document.addEventListener("DOMContentLoaded", (event) => {
    console.log("loaded");
    event.preventDefault();
    const postObject = {
        ping: 'pageReq'
    };

    reqData(postObject);
});

async function reqData(dataObject) {
    //get article details from server
    let response = await fetch(backendServerShowAllTitles, {
        method: 'POST',
        body: JSON.stringify(dataObject),
        headers: {
            'content-type': 'application/JSON'
        }
    });

    let json = await response.json();

    let jsonArray = json.result;

    //Remove all post tags and refresh everytime page is reloaded
    this.removeTag();

    //add tags to main page
    this.addTag(jsonArray);
};

function removeTag() {
    if (document.getElementById('postCont') != null && document.getElementById('postCont') != undefined) {
        document.getElementById('postCont').remove();
    };
};

function addTag(tagsData) {
    console.log(tagsData)

    //create container tag
    const postContainer = document.createElement('div');
    postContainer.setAttribute('id', 'postCont');
    allPostsTag.appendChild(postContainer);

    //create all post tags with title and links
    for (let i = 0; i < tagsData.length; i++) {
        let title = tagsData[i].title.toString().trim();
        let href = 'http://127.0.0.1:5500/Server/views' + tagsData[i].link.toString().trim();
        console.log(href)

        const divTag = document.createElement('a');
        divTag.setAttribute('href', href);
        divTag.setAttribute('class', 'individualPosts');
        divTag.textContent = title;
        postContainer.appendChild(divTag);
    };
};