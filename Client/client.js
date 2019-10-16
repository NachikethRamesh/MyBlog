const backendServerShowAllTitles = 'http://localhost:5002/main';

const allPostsTag = document.getElementById('allPosts');

window.onload(() => {
    //event.preventDefault();
    console.log("page reloaded");
    const postObject = {
        'ping': 'pageReq'
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

    var pingback = JSON.parse(json);

    //Remove all post tags and refresh everytime page is reloaded
    this.removeTag();

    //add tags to main page
    this.addTag(pingback);
};

function removeTag() {
    if (document.getElementById('postCont') != null && document.getElementById('postCont') != undefined) {
        document.getElementById('postCont').remove();
    };
};

function addTag(tagsData) {
    //create container tag
    const postContainer = document.createElement('div');
    postContainer.setAttribute('id', 'postCont');
    allPostsTag.appendChild(postContainer);

    //create all post tags with title and links
    for (var elem in tagsData) {
        let title = tagsData[elem].title.toString().trim();
        let href = tagsData[elem].href.toString().trim();

        const divTag = document.createElement('li');
        divTag.setAttribute('href', href);
        divTag.setAttribute('class', 'individualPosts');
        divTag.textContent = title;
        postContainer.appendChild(divTag);
    };
};