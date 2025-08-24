const API_KEY = "abd19ba7"; 
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const moviesContainer = document.getElementById("movies-container");
const favoritesContainer = document.getElementById("favorites-container");
const modal = document.getElementById("movie-modal");
const modalContent = document.getElementById("movie-details");
const closeModal = document.getElementById("close-modal");
const themeToggle = document.getElementById("theme-toggle");
const loading = document.getElementById("loading");

// Load favorites from localStorage
let favorites = JSON.parse(localStorage.getItem("favorites")) || {};
renderFavorites();

// Search Movies
async function searchMovies() {
  const query = searchInput.value.trim();
  if (!query) return;

  showLoading(true);

  // First try search
  let res = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`);
  let data = await res.json();

  moviesContainer.innerHTML = "";

  if (data.Response === "True") {
    renderMovies(data.Search);
  } else {
    // fallback: try exact title
    res = await fetch(`https://www.omdbapi.com/?t=${query}&apikey=${API_KEY}`);
    data = await res.json();

    if (data.Response === "True") {
      renderMovies([data]);
    } else {
      moviesContainer.innerHTML = `<p>No movies found!</p>`;
    }
  }

  showLoading(false);
}

// Render movie cards
function renderMovies(movies) {
  moviesContainer.innerHTML = "";
  movies.forEach(movie => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");
    movieCard.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/200"}" alt="${movie.Title}">
      <h3>${movie.Title} (${movie.Year})</h3>
      <button class="favorite-btn ${favorites[movie.imdbID] ? "active" : ""}" data-id="${movie.imdbID}">
        ❤️
      </button>
    `;

    // Show details on click
    movieCard.querySelector("img").addEventListener("click", () => showMovieDetails(movie.imdbID));

    // Handle favorite button
    movieCard.querySelector(".favorite-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(movie);
    });

    moviesContainer.appendChild(movieCard);
  });
}

// Show Movie Details
async function showMovieDetails(id) {
  const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`);
  const movie = await res.json();

  modalContent.innerHTML = `
    <h2>${movie.Title} (${movie.Year})</h2>
    <p><strong>Genre:</strong> ${movie.Genre}</p>
    <p><strong>Plot:</strong> ${movie.Plot}</p>
    <p><strong>Actors:</strong> ${movie.Actors}</p>
    <p><strong>Rating:</strong> ${movie.imdbRating} ⭐</p>
    <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300"}" alt="${movie.Title}">
  `;
  modal.classList.remove("hidden");
}

// Toggle Favorites
function toggleFavorite(movie) {
  if (favorites[movie.imdbID]) {
    delete favorites[movie.imdbID];
  } else {
    favorites[movie.imdbID] = movie;
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
  searchMovies(); // re-render to update ❤️ status
}

// Render Favorites
function renderFavorites() {
  favoritesContainer.innerHTML = "";
  Object.values(favorites).forEach(movie => {
    const favCard = document.createElement("div");
    favCard.classList.add("movie-card");
    favCard.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/200"}" alt="${movie.Title}">
      <h3>${movie.Title} (${movie.Year})</h3>
      <button class="favorite-btn active" data-id="${movie.imdbID}">❤️</button>
    `;
    favCard.querySelector("img").addEventListener("click", () => showMovieDetails(movie.imdbID));
    favCard.querySelector(".favorite-btn").addEventListener("click", () => toggleFavorite(movie));
    favoritesContainer.appendChild(favCard);
  });
}

// Close Modal
closeModal.addEventListener("click", () => modal.classList.add("hidden"));

// Search Button
searchBtn.addEventListener("click", searchMovies);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMovies();
});

// Dark Mode Toggle
themeToggle.addEventListener("click", () => {
  if (document.body.style.getPropertyValue("--bg-color") === "#222") {
    // Switch to light
    document.body.style.setProperty("--bg-color", "#f9f9f9");
    document.body.style.setProperty("--text-color", "#222");
    document.body.style.setProperty("--card-bg", "#ffffff");
    themeToggle.textContent = "🌙 Dark Mode";
  } else {
    // Switch to dark
    document.body.style.setProperty("--bg-color", "#222");
    document.body.style.setProperty("--text-color", "#f9f9f9");
    document.body.style.setProperty("--card-bg", "#333");
    themeToggle.textContent = "☀️ Light Mode";
  }
});

// Show/Hide Loading
function showLoading(state) {
  loading.classList.toggle("hidden", !state);
}
