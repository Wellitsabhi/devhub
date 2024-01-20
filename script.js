const url = "https://api.github.com/users/";
const get = (element) => document.getElementById(`${element}`);

const input = get("input");
const btn = get("btn");


//  On click 'search' , API call is done by function 'getuserdata'
btn.addEventListener('click', () => {
    // is deprecated , but working
    simulateAction();
    event.preventDefault();
    if (input.value !== "") {
        getUserData(url + input.value);
    }

    // clear the input tag as soon as button is clicked
    input.value = "";

})


// When type, url gets updated, in function
input.addEventListener('keydown', (e) => {
    // console.log(e.key);

    simulateAction();
    if (e.key === 'Enter') {
        if (input.value !== "") {
            getUserData(url + input.value);
        }
    }
}, false);

input.addEventListener('change', (e) => {
    input.value = e.target.value;
});

// API call with new url
async function getUserData(gitUrl) {



    const response = await fetch(gitUrl);
    const data = await response.json();
    console.log(data);
    if (!data) {
        throw data;
    }
    updateProfile(data);
    fetchUserRepos(gitUrl);


    // return data;
}

const noResults = get("noResults");

function updateProfile(data) {
    noResults.style.scale = 0;

    const apiUrl = get("url");
    if (data.message !== "Not Found") {
        function checkNull(apiItem, domItem) {
            if (apiItem === "" || apiItem === null) {
                domItem.style.opacity = 0.5;
                domItem.previousElementSibling.style.opacity = 0.5;
                return false;


            }
            else {
                return true;
            }
        }
        const userImage = get("userImage");
        const name = get("name");
        const username = get("username");
        const bio = get("bio");
        const location = get("location");
        const twitter = get("twitter");
        const url = get("url");

        // const company = get("company");   // Never used
        // const repos = get("repos");    //Never used

        userImage.src = `${data.avatar_url}`;
        name.innerText = data?.name;
        username.innerText = `@${data?.login}`;
        username.href = data?.html_url;
        url.innerText = data?.html_url;

        bio.innerText = (data?.bio === null) ? "This Profile has no Bio" : `Bio: ${data?.bio}`;
        location.innerText = checkNull(data?.location, location) ? `Location: ${data?.location}` : "Location: Not Available";
        twitter.innerHTML = checkNull(data?.twitter_username, twitter)
            ? `Twitter: <a href="https://twitter.com/${data?.twitter_username}" target="_blank">${data?.twitter_username}</a>`
            : "Twitter: Not Available";
        url.href = checkNull(data?.url, url) ? data?.html_url : "Not Available";

    }
    else {
        noResults.style.scale = 1;
        setTimeout(() => {
            noResults.style.scale = 0;
        }, 2500);
    }
}

// Declaration for pagination
const perPage = 10;
let currentPage = 1;
let totalPages;

const paginationContainer = get("paginationContainer");
const reposContainer = get("repos-container");


let reposUrl;
async function fetchUserRepos(userUrl) {
    reposUrl = `${userUrl}/repos`;
    // let cp = currentPage;
    try {


        const response = await fetch(reposUrl);
        // const response = await fetch(`${reposUrl}?page=${cp}&per_page=${perPage}`);
        const reposData = await response.json();
        totalPages = Math.ceil(reposData.length / perPage);

        console.log(reposData);   // check
        console.log(totalPages);   // check
        displayUserRepos(reposData);
        updatePagination();

        return;
    } catch (error) {
        console.error('Error fetching user repositories:', error);
    }
}

async function fetchnewrepos(reposUrl, currentPage) {
    // const reposUrl = `${temp}/repos`;
    let cp = currentPage;
    try {


        const response = await fetch(`${reposUrl}?page=${cp}&per_page=${perPage}`);
        const reposData = await response.json();
        // totalPages = Math.ceil(reposData.length / perPage);

        console.log(reposData);   // check
        console.log(totalPages);   // check
        displayUserRepos(reposData);
        updatePagination();

        return;
    } catch (error) {
        console.error('Error fetching user repositories:', error);
    }

    // const reposData = await response.json();
    // displayUserRepos(reposData);
    // updatePagination();
}




function displayUserRepos(reposData) {
    const reposContainer = get("repos-container");
    reposContainer.innerHTML = "<h3>User Repositories:</h3>";

    if (reposData.length > 0) {
        // const ul = document.createElement("ul");
        reposData.forEach(repo => {
            // card
            const card = document.createElement("div");
            card.classList.add("card", "flex-column", "mb-3");
            // cardHeader
            const cardHeader = document.createElement("div");
            cardHeader.classList.add("card-header");
            cardHeader.textContent = repo.name;
            // cardbody
            const cardBody = document.createElement("div");
            cardBody.classList.add("card-body");
            // description
            const repoDescription = document.createElement("h5");
            repoDescription.classList.add("card-title");
            repoDescription.textContent = repo.description || "No description available.";
            // last updated
            const repoUpdated = document.createElement("p");
            repoUpdated.classList.add("card-text");
            // date format
            const updatedAt = repo.updated_at;
            const formattedDate = updatedAt ? new Date(updatedAt).toLocaleString() : "";
            repoUpdated.textContent = " Last Updated at - " + formattedDate;
            // language
            const repoLanguage = document.createElement("a");
            repoLanguage.classList.add("btn", "btn-primary");
            repoLanguage.textContent = repo.language || "Lang";

            // Append 
            cardBody.appendChild(repoDescription);
            cardBody.appendChild(repoLanguage);
            cardBody.appendChild(repoUpdated);
            card.appendChild(cardHeader);
            card.appendChild(cardBody);
            reposContainer.appendChild(card);

        });
    } else {
        reposContainer.innerHTML += "<p>No repositories found.</p>";
    }



}



function updatePagination() {

    paginationContainer.innerHTML = ""; // Clear existing content

    const prevButton = createPaginationButton("Previous", currentPage - 1);
    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = createPaginationButton(i.toString(), i);
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = createPaginationButton("Next", currentPage + 1);
    paginationContainer.appendChild(nextButton);
}

function createPaginationButton(text, page) {
    const li = document.createElement("li");
    li.classList.add("page-item");
    if (page === currentPage) {
        li.classList.add("active");
    }

    const link = document.createElement("a");
    link.classList.add("page-link");
    link.textContent = text;
    link.href = "#";
    link.addEventListener("click", () => {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            // fetchUserRepos(reposUrl);
            fetchnewrepos(reposUrl, currentPage);
        }
    });

    if (page < 1 || page > totalPages) {
        li.classList.add("disabled");
    }

    li.appendChild(link);
    return li;
}



// Copy to clipboard
const linkIcon = document.querySelector('.material-symbols-outlined');
const urlElement = document.getElementById('url');
linkIcon.addEventListener('click', () => {

    const tempInput = document.createElement('input');
    tempInput.value = urlElement.textContent;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');   //Deprecated     
    document.body.removeChild(tempInput);

    alert('Link copied to clipboard!');
});

// Loader
function showLoader() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
}
function hideLoader() {
    const loader = document.getElementById('loader');
    loader.style.display = 'none';
}
function simulateAction() {
    showLoader();
    setTimeout(() => {

    }, 2000);
}


getUserData(url + "wellitsabhi");