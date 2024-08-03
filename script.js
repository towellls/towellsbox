// Get the modal
var modal = document.getElementById("ratingModal");

// Get the button that opens the modal
var btn = document.querySelector(".plus-button");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Handle album search, rating, and like functionality
let selectedAlbum = null;
let rating = 0;
let liked = false;

// Example function to search for albums
function searchAlbums(query) {
    // Mock search results
    const results = [
        { id: 1, name: 'Album 1', cover: 'brat.png' },
        { id: 2, name: 'Album 2', cover: 'brat.png' }
    ];
    const searchResultsDiv = document.getElementById("searchResults");
    searchResultsDiv.innerHTML = results.map(album => 
        `<div class="search-result" data-id="${album.id}" data-name="${album.name}" data-cover="${album.cover}">${album.name}</div>`
    ).join('');
}

document.getElementById("albumSearch").addEventListener("input", function() {
    const query = this.value;
    if (query) {
        searchAlbums(query);
    }
});

document.getElementById("searchResults").addEventListener("click", function(e) {
    if (e.target && e.target.matches(".search-result")) {
        selectedAlbum = { 
            id: e.target.dataset.id, 
            name: e.target.dataset.name,
            cover: e.target.dataset.cover 
        };
        alert(`Selected album: ${selectedAlbum.name}`);
    }
});

document.querySelectorAll(".star").forEach(star => {
    star.addEventListener("click", function() {
        rating = this.dataset.value;
        alert(`Rated: ${rating} stars`);
    });
});

document.querySelector(".heart").addEventListener("click", function() {
    liked = !liked;
    this.classList.toggle('liked');
    alert(`Liked: ${liked}`);
});

let pastRatings = [];

function renderRatings() {
    const albumsDiv = document.querySelector(".albums");
    albumsDiv.innerHTML = pastRatings.map(rating => 
        `<div class="album">
            <img src="${rating.album.cover}" alt="${rating.album.name}">
            <span>${rating.album.name}</span>
            <div>${'★'.repeat(rating.stars)}</div>
            <div>${rating.liked ? '♥' : ''}</div>
        </div>`
    ).join('');
}

document.getElementById("saveRating").addEventListener("click", function() {
    if (selectedAlbum && rating) {
        // Save the rating
        const newRating = {
            album: { 
                id: selectedAlbum.id, 
                name: selectedAlbum.name, 
                cover: selectedAlbum.cover 
            },
            stars: rating,
            liked: liked
        };
        pastRatings.unshift(newRating);
        // Render the updated ratings grid
        renderRatings();
        // Reset the form
        selectedAlbum = null;
        rating = 0;
        liked = false;
        document.getElementById("albumSearch").value = '';
        document.getElementById("searchResults").innerHTML = '';
        document.querySelectorAll(".star").forEach(star => star.style.color = 'black');
        document.querySelector(".heart").classList.remove('liked');
        modal.style.display = "none";
    } else {
        alert("Please select an album and give a rating.");
    }
});

// Initial render
renderRatings();
