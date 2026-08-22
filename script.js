// You can edit ALL of the code here

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Clear the page before adding the episode cards.
  rootElem.textContent = "";

  const episodeCount = document.createElement("p");
  episodeCount.textContent = `Showing ${episodeList.length} episode(s)`;
  rootElem.appendChild(episodeCount);

  const episodeListElement = document.createElement("section");
  episodeListElement.className = "episode-list";
  episodeListElement.setAttribute("aria-label", "Game of Thrones episodes");

  for (const episode of episodeList) {
    const episodeCard = makeEpisodeCard(episode);
    episodeListElement.appendChild(episodeCard);
  }

  rootElem.appendChild(episodeListElement);
}

function makeEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";

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
