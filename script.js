document.addEventListener("DOMContentLoaded", function () {
    // Get the modal
    var modal = document.getElementById("reviewModal");

    // Get the button that opens the modal
    var btn = document.getElementById("addReviewButton");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal 
    btn.onclick = function () {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    let selectedAlbum = null;
    let rating = 0;
    let liked = false;

    // Function to search for albums using MusicBrainz API
    function searchAlbums(query) {
        const url = `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(query)}&fmt=json`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                displaySearchResults(data['release-groups']);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function displaySearchResults(albums) {
        const searchResultsDiv = document.getElementById("searchResults");
        searchResultsDiv.innerHTML = albums.map(album => `
            <div class="search-result" data-id="${album.id}" data-name="${album.title}">
                ${album.title} - ${album['artist-credit'][0].name}
            </div>
        `).join('');
    }

    document.getElementById("albumSearch").addEventListener("input", function () {
        const query = this.value;
        if (query) {
            searchAlbums(query);
        }
    });

    document.getElementById("searchResults").addEventListener("click", function (e) {
        if (e.target && e.target.matches(".search-result")) {
            selectedAlbum = {
                id: e.target.dataset.id,
                name: e.target.dataset.name
            };
            alert(`Selected album: ${selectedAlbum.name}`);
        }
    });

    document.querySelectorAll(".star").forEach(star => {
        star.addEventListener("click", function () {
            rating = this.dataset.value;
            alert(`Rated: ${rating} stars`);
        });
    });

    document.querySelector(".heart").addEventListener("click", function () {
        liked = !liked;
        this.classList.toggle('liked');
        alert(`Liked: ${liked}`);
    });

    let pastRatings = {
        today: [],
        yesterday: [],
        month: []
    };

    function renderRatings() {
        const todayGrid = document.getElementById("todayGrid");
        const yesterdayGrid = document.getElementById("yesterdayGrid");
        const monthGrid = document.getElementById("monthGrid");

        todayGrid.innerHTML = pastRatings.today.map(rating => renderAlbum(rating)).join('');
        yesterdayGrid.innerHTML = pastRatings.yesterday.map(rating => renderAlbum(rating)).join('');
        monthGrid.innerHTML = pastRatings.month.map(rating => renderAlbum(rating)).join('');
    }

    function renderAlbum(rating) {
        return `
            <div class="album">
                <img src="https://via.placeholder.com/100" alt="${rating.album.name}">
               
