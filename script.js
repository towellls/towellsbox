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
            fetchCoverArt(selectedAlbum.id);
        }
    });

    document.querySelectorAll(".star").forEach(star => {
        star.addEventListener("click", function () {
            rating = this.dataset.value;
            // Highlight selected stars
            document.querySelectorAll(".star").forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            let prevStar = this.previousElementSibling;
            while (prevStar) {
                prevStar.classList.add('selected');
                prevStar = prevStar.previousElementSibling;
            }
        });
    });

    document.querySelector(".heart").addEventListener("click", function () {
        liked = !liked;
        this.classList.toggle('liked');
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
                <img src="${rating.album.cover}" alt="${rating.album.name}">
                <span>${rating.album.name}</span>
                <div>${'★'.repeat(rating.stars)}</div>
                <div>${rating.liked ? '♥' : ''}</div>
            </div>
        `;
    }

    document.getElementById("saveRating").addEventListener("click", function () {
        if (selectedAlbum && rating) {
            // Save the rating
            const newRating = {
                album: {
                    id: selectedAlbum.id,
                    name: selectedAlbum.name,
                    cover: selectedAlbum.cover || 'https://via.placeholder.com/100'
                },
                stars: rating,
                liked: liked
            };
            // For now, add to today's list
            pastRatings.today.unshift(newRating);
            // Render the updated ratings grid
            renderRatings();
            // Reset the form
            selectedAlbum = null;
            rating = 0;
            liked = false;
            document.getElementById("albumSearch").value = '';
            document.getElementById("searchResults").innerHTML = '';
            document.querySelectorAll(".star").forEach(star => star.classList.remove('selected'));
            document.querySelector(".heart").classList.remove('liked');
            modal.style.display = "none";
        } else {
            alert("Please select an album and give a rating.");
        }
    });

    // Fetch cover art using Cover Art Archive API
    function fetchCoverArt(releaseGroupId) {
        const url = `https://coverartarchive.org/release-group/${releaseGroupId}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('No cover art found');
                }
                return response.json();
            })
            .then(data => {
                const imageUrl = data.images[0].thumbnails.large || data.images[0].image;
                selectedAlbum.cover = imageUrl;
                alert(`Selected album cover art fetched`);
            })
            .catch(error => {
                console.error('Error fetching cover art:', error);
                selectedAlbum.cover = 'https://via.placeholder.com/100'; // Fallback to placeholder
            });
    }

    // Initial render
    renderRatings();
});
