document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("reviewModal");
    const btn = document.getElementById("addReviewButton");
    const span = document.querySelector(".close");
    const albumSearchInput = document.getElementById("albumSearch");
    const searchResultsDiv = document.getElementById("searchResults");

    let selectedAlbum = null;
    let rating = 0;
    let liked = false;

    // Open the modal when the button is clicked
    btn.onclick = function () {
        modal.style.display = "block";
    }

    // Close the modal when the 'x' is clicked
    span.onclick = function () {
        modal.style.display = "none";
    }

    // Close the modal when clicking outside of it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

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
        searchResultsDiv.innerHTML = albums.map(album => `
            <div class="search-result" data-id="${album.id}" data-name="${album.title}">
                ${album.title} - ${album['artist-credit'][0].name}
            </div>
        `).join('');

        // Add event listeners to search results for album selection
        document.querySelectorAll(".search-result").forEach(item => {
            item.addEventListener("click", function () {
                selectedAlbum = {
                    id: this.dataset.id,
                    name: this.dataset.name
                };
                fetchCoverArt(selectedAlbum.id);
            });
        });
    }

    albumSearchInput.addEventListener("input", function () {
        const query = this.value;
        if (query) {
            searchAlbums(query);
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
            const newRating = {
                album: {
                    id: selectedAlbum.id,
                    name: selectedAlbum.name,
                    cover: selectedAlbum.cover || 'https://via.placeholder.com/100'
                },
                stars: rating,
                liked: liked
            };
            pastRatings.today.unshift(newRating);
            renderRatings();
            selectedAlbum = null;
            rating = 0;
            liked = false;
            albumSearchInput.value = '';
            searchResultsDiv.innerHTML = '';
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
            })
            .catch(error => {
                console.error('Error fetching cover art:', error);
                selectedAlbum.cover = 'https://via.placeholder.com/100';
            });
    }

    renderRatings();
});
