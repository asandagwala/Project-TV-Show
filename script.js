// You can edit ALL of the code here

let allEpisodes = [];
let allShows = [];

const showsUrl = "https://api.tvmaze.com/shows";
const fetchedData = new Map();

async function setup() {
  showLoadingMessage("Loading shows...");

  try {
    allShows = await getData(showsUrl);
    sortShowsByName(allShows);
    makePageForShows();
  } catch (error) {
    showPageErrorMessage("Sorry, we could not load the shows. Please refresh the page and try again.");
    console.error(error);
  }
}

function getData(url) {
  // Save each request so the same URL is never fetched twice during one visit.
  if (fetchedData.has(url)) {
    return fetchedData.get(url);
  }

  const request = fetch(url).then(function (response) {
    if (!response.ok) {
      throw new Error("The data could not be loaded.");
    }

    return response.json();
  });

  fetchedData.set(url, request);
  return request;
}

function sortShowsByName(showList) {
  showList.sort(function (firstShow, secondShow) {
    return firstShow.name.localeCompare(secondShow.name, undefined, {
      sensitivity: "base",
    });
  });
}

function makePageForShows() {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "";

  const showControls = document.createElement("section");
  showControls.className = "show-controls";

  const showLabel = document.createElement("label");
  showLabel.htmlFor = "show-selector";
  showLabel.textContent = "Choose a TV show";
  showControls.appendChild(showLabel);

  const showSelector = document.createElement("select");
  showSelector.id = "show-selector";
  showSelector.addEventListener("change", handleShowSelection);

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choose a show";
  showSelector.appendChild(defaultOption);

  for (const show of allShows) {
    const showOption = document.createElement("option");
    showOption.value = show.id;
    showOption.textContent = show.name;
    showSelector.appendChild(showOption);
  }

  showControls.appendChild(showSelector);
  rootElem.appendChild(showControls);

  const episodeView = document.createElement("section");
  episodeView.id = "episode-view";
  rootElem.appendChild(episodeView);
}

async function handleShowSelection(event) {
  const showId = event.target.value;
  const episodeView = document.getElementById("episode-view");

  if (showId === "") {
    episodeView.textContent = "";
    return;
  }

  const selectedShow = allShows.find(function (show) {
    return show.id === Number(showId);
  });

  showEpisodeLoadingMessage();

  try {
    const episodeUrl = `https://api.tvmaze.com/shows/${showId}/episodes`;
    allEpisodes = await getData(episodeUrl);
    makePageForEpisodes(allEpisodes, selectedShow.name);
  } catch (error) {
    showEpisodeErrorMessage();
    console.error(error);
  }
}

function showLoadingMessage(message) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = message;
}

function showPageErrorMessage(message) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "";

  const errorMessage = document.createElement("p");
  errorMessage.textContent = message;
  errorMessage.setAttribute("role", "alert");
  rootElem.appendChild(errorMessage);
}

function showEpisodeLoadingMessage() {
  const episodeView = document.getElementById("episode-view");
  episodeView.textContent = "Loading episodes...";
}

function showEpisodeErrorMessage() {
  const episodeView = document.getElementById("episode-view");
  episodeView.textContent = "";

  const errorMessage = document.createElement("p");
  errorMessage.textContent =
    "Sorry, we could not load this show's episodes. Please choose another show or refresh the page.";
  errorMessage.setAttribute("role", "alert");
  episodeView.appendChild(errorMessage);
}

function makePageForEpisodes(episodeList, showName) {
  const episodeView = document.getElementById("episode-view");
  episodeView.textContent = "";

  const heading = document.createElement("h2");
  heading.textContent = `${showName} Episodes`;
  episodeView.appendChild(heading);

  const controls = makeEpisodeControls(episodeList);
  episodeView.appendChild(controls);

  const episodeCount = document.createElement("p");
  episodeCount.id = "episode-count";
  episodeCount.setAttribute("aria-live", "polite");
  episodeView.appendChild(episodeCount);

  const episodeListElement = document.createElement("section");
  episodeListElement.id = "episode-list";
  episodeListElement.className = "episode-list";
  episodeListElement.setAttribute("aria-label", `${showName} episodes`);
  episodeView.appendChild(episodeListElement);

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

  const title = document.createElement("h3");
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
