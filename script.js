// You can edit ALL of the code here

let allEpisodes = [];

function setup() {
  allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Clear the page before adding the search, selector, and episode cards.
  rootElem.textContent = "";

  const controls = makeEpisodeControls(episodeList);
  rootElem.appendChild(controls);

  const episodeCount = document.createElement("p");
  episodeCount.id = "episode-count";
  episodeCount.setAttribute("aria-live", "polite");
  rootElem.appendChild(episodeCount);

  const episodeListElement = document.createElement("section");
  episodeListElement.id = "episode-list";
  episodeListElement.className = "episode-list";
  episodeListElement.setAttribute("aria-label", "Game of Thrones episodes");
  rootElem.appendChild(episodeListElement);

  displayEpisodes(episodeList);
}

function makeEpisodeControls(episodeList) {
  const controls = document.createElement("section");
  controls.className = "episode-controls";
  controls.setAttribute("aria-label", "Episode controls");

  const searchLabel = document.createElement("label");
  searchLabel.htmlFor = "episode-search";
  searchLabel.textContent = "Search episodes";
  controls.appendChild(searchLabel);

  const searchInput = document.createElement("input");
  searchInput.id = "episode-search";
  searchInput.type = "search";
  searchInput.placeholder = "Search by name or summary";
  searchInput.addEventListener("input", handleSearch);
  controls.appendChild(searchInput);

  const selectorLabel = document.createElement("label");
  selectorLabel.htmlFor = "episode-selector";
  selectorLabel.textContent = "Jump to an episode";
  controls.appendChild(selectorLabel);

  const episodeSelector = document.createElement("select");
  episodeSelector.id = "episode-selector";
  episodeSelector.addEventListener("change", jumpToSelectedEpisode);

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choose an episode";
  episodeSelector.appendChild(defaultOption);

  for (const episode of episodeList) {
    const option = document.createElement("option");
    option.value = `episode-${episode.id}`;
    option.textContent = `${makeEpisodeCode(episode)} - ${episode.name}`;
    episodeSelector.appendChild(option);
  }

  controls.appendChild(episodeSelector);
  return controls;
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const matchingEpisodes = allEpisodes.filter(function (episode) {
    const episodeName = episode.name.toLowerCase();
    const episodeSummary = episode.summary.toLowerCase();

    return episodeName.includes(searchTerm) || episodeSummary.includes(searchTerm);
  });

  displayEpisodes(matchingEpisodes);
}

function displayEpisodes(episodeList) {
  const episodeCount = document.getElementById("episode-count");
  const episodeListElement = document.getElementById("episode-list");

  episodeCount.textContent = `Showing ${episodeList.length} episode(s)`;
  episodeListElement.textContent = "";

  for (const episode of episodeList) {
    const episodeCard = makeEpisodeCard(episode);
    episodeListElement.appendChild(episodeCard);
  }
}

function jumpToSelectedEpisode(event) {
  const selectedEpisodeId = event.target.value;

  if (selectedEpisodeId === "") {
    return;
  }

  let selectedEpisode = document.getElementById(selectedEpisodeId);

  // If a search has hidden this episode, show every episode before jumping to it.
  if (selectedEpisode === null) {
    const searchInput = document.getElementById("episode-search");
    searchInput.value = "";
    displayEpisodes(allEpisodes);
    selectedEpisode = document.getElementById(selectedEpisodeId);
  }

  selectedEpisode.scrollIntoView({ behavior: "smooth", block: "start" });
  selectedEpisode.focus({ preventScroll: true });
}

function makeEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";
  card.id = `episode-${episode.id}`;
  card.tabIndex = -1;

  const title = document.createElement("h2");
  title.textContent = `${makeEpisodeCode(episode)} - ${episode.name}`;
  card.appendChild(title);

  const image = document.createElement("img");
  image.src = episode.image.medium;
  image.alt = `Scene from ${episode.name}`;
  card.appendChild(image);

  const summary = document.createElement("div");
  // The summary comes from TVMaze and contains paragraph HTML.
  summary.innerHTML = episode.summary;
  card.appendChild(summary);

  return card;
}

function makeEpisodeCode(episode) {
  const seasonNumber = String(episode.season).padStart(2, "0");
  const episodeNumber = String(episode.number).padStart(2, "0");

  return `S${seasonNumber}E${episodeNumber}`;
}

window.onload = setup;
