// === Development Toggle ===
const devEditMode = false;
const devPopupId = "profilePopup"; // dev-only popup

document.addEventListener("DOMContentLoaded", () => {
  // --- Handle initial popup ---
  if (devEditMode && devPopupId !== "contactPopup") {
    keepPopupOpen(devPopupId);
  } else if (!localStorage.getItem("welcomePopupClosed")) {
    // Always open welcomePopup on first visit
    keepPopupOpen("welcomePopup");
  }

  // --- Icon tapped state ---
  const icons = document.querySelectorAll(".icon");
  icons.forEach(icon => {
    icon.addEventListener("click", () => {
      icons.forEach(i => i !== icon && i.classList.remove("tapped"));
      icon.classList.toggle("tapped");
    });
  });

  // --- Analog clock ---
  setInterval(updateClock, 1000);
  updateClock();

  // --- Works Popup ---
  const worksPopupBody = document.querySelector('#worksPopup .popup-body');
  if (worksPopupBody) setupWorksPopup(worksPopupBody);

  // --- Email copy ---
  const emailElement = document.getElementById("emailLink");
  if (emailElement) setupEmailCopy(emailElement);
});

// --- Analog clock ---
function updateClock() {
  const now = new Date();
  const secDeg = now.getSeconds() * 6;
  const minDeg = now.getMinutes() * 6 + now.getSeconds() * 0.1;
  const hourDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;

  const secHand = document.querySelector(".hand.second");
  const minHand = document.querySelector(".hand.minute");
  const hourHand = document.querySelector(".hand.hour");

  if (secHand) secHand.style.transform = `rotate(${secDeg}deg)`;
  if (minHand) minHand.style.transform = `rotate(${minDeg}deg)`;
  if (hourHand) hourHand.style.transform = `rotate(${hourDeg}deg)`;
}

// --- Works Popup Helper ---
function setupWorksPopup(worksPopupBody) {
  const animationContainer = document.createElement('div');
  animationContainer.className = 'popup-animation';
  worksPopupBody.parentNode.insertBefore(animationContainer, worksPopupBody);

  fetch('works.json')
    .then(res => res.json())
    .then(data => {
      const categories = ["Animation", ...Object.keys(data).filter(c => c !== "Animation")];
      categories.forEach(category => {
        const divider = document.createElement('div');
        divider.className = 'works-divider';
        divider.textContent = category;
        const container = category === "Animation" ? animationContainer : worksPopupBody;
        container.appendChild(divider);
        data[category].forEach(work => {
          const card = document.createElement('div');
          card.className = 'work-item';
          if (work.image) {
            const img = document.createElement('img');
            img.src = work.image;
            img.alt = work.title || "Untitled";
            card.appendChild(img);
            card.addEventListener('click', () => openLightbox(work, 'worksPopup'));
          } else if (work.video) {
            const thumb = document.createElement('img');
            thumb.src = work.thumbnail;
            thumb.alt = work.title || "Untitled";
            card.appendChild(thumb);
            card.addEventListener('click', () => openLightbox(work, 'worksPopup', true));
          }
          container.appendChild(card);
        });
      });
    })
    .catch(err => console.error("Failed to load works.json:", err));
}

// --- Email Copy Helper ---
function setupEmailCopy(emailElement) {
  emailElement.addEventListener("click", () => {
    const email = emailElement.innerText;
    navigator.clipboard.writeText(email).then(() => {
      const originalTitle = emailElement.getAttribute("title");
      emailElement.setAttribute("title", "Copied!");
      setTimeout(() => emailElement.setAttribute("title", originalTitle), 1000);
    });
  });
}

// --- Lightbox helper ---
function openLightbox(work, popupId, isVideo = false) {
  const popup = document.getElementById(popupId);
  if (!popup) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';

  if (isVideo) {
    const video = document.createElement('video');
    video.src = work.video;
    video.controls = true;
    video.autoplay = true;
    video.style.maxWidth = '90vw';
    video.style.maxHeight = '90vh';
    video.style.borderRadius = '6px';
    lightbox.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = work.image;
    img.alt = work.title || "Untitled";
    lightbox.appendChild(img);
  }

  if (work.title || work.description) {
    const caption = document.createElement('div');
    caption.className = 'lightbox-caption';
    if (work.title) {
      const titleEl = document.createElement('h3');
      titleEl.textContent = work.title;
      caption.appendChild(titleEl);
    }
    if (work.description) {
      const descEl = document.createElement('p');
      descEl.textContent = work.description;
      caption.appendChild(descEl);
    }
    lightbox.appendChild(caption);
  }

  document.body.appendChild(lightbox);
  popup.style.display = 'none';

  lightbox.addEventListener('click', e => {
    if (!isVideo || e.target === lightbox) {
      lightbox.remove();
      popup.style.display = 'flex';
      restoreScrollable(popup);
    }
  });
}

// --- Skills Lightbox ---
function openSkillsLightbox() {
  const overlay = document.getElementById('skillsLightbox');
  if (!overlay) return;

  overlay.style.display = 'flex';
  const content = overlay.querySelector('.lightbox-content');
  const coreNode = content.querySelector('.skill-node.main');

  setTimeout(() => {
    if (coreNode) {
      content.scrollTop = coreNode.offsetTop - content.clientHeight / 2 + coreNode.clientHeight / 2;
      content.scrollLeft = coreNode.offsetLeft - content.clientWidth / 2 + coreNode.clientWidth / 2;
    }
  }, 50);
}

const toggleBtn = document.getElementById('skillsToggle');
const treeWrapper = document.querySelector('.skills-scroll-wrapper');
const listView = document.querySelector('.skills-list');
const legend = document.querySelector('.skills-legend');

function updateViewOnResize() {
  if (!toggleBtn || !treeWrapper || !listView || !legend) return;
  if (window.innerWidth <= 600) {
    treeWrapper.style.display = 'none';
    listView.style.display = 'block';
    toggleBtn.style.display = 'none';
    legend.style.display = 'none';
  } else {
    treeWrapper.style.display = 'flex';
    listView.style.display = 'none';
    toggleBtn.style.display = 'block';
    toggleBtn.textContent = 'Switch to List View';
    legend.style.display = 'flex';
  }
}
updateViewOnResize();
window.addEventListener('resize', updateViewOnResize);

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    if (!treeWrapper || !listView || !legend) return;
    if (treeWrapper.style.display !== 'none') {
      treeWrapper.style.display = 'none';
      listView.style.display = 'block';
      toggleBtn.textContent = 'Switch to Tree View';
      legend.style.display = 'none';
    } else {
      treeWrapper.style.display = 'flex';
      listView.style.display = 'none';
      toggleBtn.textContent = 'Switch to List View';
      legend.style.display = 'flex';
    }
  });
}

function closeSkillsLightbox(event) {
  event.currentTarget.style.display = 'none';
}

// --- Popup utilities (amended) ---
function keepPopupOpen(id) {
  const popup = document.getElementById(id);
  if (!popup) return;

  const useFlex = popup.classList.contains('popup-works') ||
                  popup.classList.contains('popup-profile') ||
                  popup.classList.contains('popup-cat') ||
                  popup.classList.contains('popup-general') ||
                  popup.classList.contains('popup-contact');

  popup.style.display = useFlex ? "flex" : "block";
  restoreScrollable(popup);
}

function togglePopup(id) {
  const popup = document.getElementById(id);
  if (!popup) return;

  // If the popup is already visible, close it
  if (popup.style.display === 'flex' || popup.style.display === 'block') {
    popup.style.display = 'none';
    // Special case for welcomePopup: mark as closed
    if (id === 'welcomePopup') {
      localStorage.setItem('welcomePopupClosed', 'true');
    }
    return;
  }

  // Hide all other popups
  document.querySelectorAll('.popup').forEach(p => p.style.display = 'none');

  keepPopupOpen(id);
}

function closePopup(id) {
  const popup = document.getElementById(id);
  if (!popup) return;

  popup.style.display = 'none';

  const scrollable = popup.querySelector('.popup-scrollable');
  if (scrollable) scrollable.scrollTop = 0;

  // Mark welcomePopup as closed in localStorage
  if (id === 'welcomePopup') {
    localStorage.setItem('welcomePopupClosed', 'true');
  }
}

function restoreScrollable(popup) {
  const scrollable = popup.querySelector('.popup-scrollable');
  if (!scrollable) return;

  scrollable.style.overflowY = 'hidden';
  scrollable.offsetHeight; // force reflow
  scrollable.style.overflowY = 'auto';
}
// === Music Player ===
const musicPlayer = document.getElementById('musicPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const volUpBtn = document.getElementById('volUpBtn');
const volDownBtn = document.getElementById('volDownBtn');
const muteBtn = document.getElementById('muteBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const musicList = document.querySelector('.music-list');
const scrubber = document.getElementById('scrubber');
const songImg = document.querySelector('.song-img img');

let tracks = [], trackItems = [], currentTrack = 0, isPlaying = false, previousVolume = 0.3;

fetch('tracks.json').then(res => res.json()).then(data => {
  tracks = data;
  musicList.innerHTML = '';
  tracks.forEach((track, index) => {
    const div = document.createElement('div');
    div.className = 'track-item';
    div.dataset.index = index;
    div.textContent = track.title;
    musicList.appendChild(div);
  });
  trackItems = document.querySelectorAll('.track-item');
  trackItems.forEach(item => item.addEventListener('click', () => loadTrack(Number(item.dataset.index))));
  nextBtn.addEventListener('click', () => loadTrack((currentTrack + 1) % tracks.length));
  prevBtn.addEventListener('click', () => loadTrack((currentTrack - 1 + tracks.length) % tracks.length));
  musicPlayer.volume = 0.3;
  previousVolume = 0.3;
  loadTrack(0);
});

musicPlayer.addEventListener('ended', () => { loadTrack((currentTrack + 1) % tracks.length); if (isPlaying) musicPlayer.play(); });

function loadTrack(index) {
  currentTrack = index;
  musicPlayer.src = tracks[currentTrack].src;
  songImg.src = tracks[currentTrack].cover;
  highlightActiveTrack();
  if (isPlaying) musicPlayer.play();
  playPauseBtn.textContent = isPlaying ? "⏸️" : "▶️";
  playPauseBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  playPauseBtn.setAttribute("title", isPlaying ? "Pause" : "Play");
}

playPauseBtn.addEventListener('click', () => {
  if (!isPlaying) {
    musicPlayer.play();
    isPlaying = true;
  } else {
    musicPlayer.pause();  // <- this alone will close the Android audio player
    isPlaying = false;
  }

  playPauseBtn.textContent = isPlaying ? "⏸️" : "▶️";
  playPauseBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  playPauseBtn.setAttribute("title", isPlaying ? "Pause" : "Play");
});

volUpBtn.addEventListener('click', () => musicPlayer.volume = Math.min(1, musicPlayer.volume + 0.1));
volDownBtn.addEventListener('click', () => musicPlayer.volume = Math.max(0, musicPlayer.volume - 0.1));
muteBtn.addEventListener('click', () => {
  if (musicPlayer.volume > 0) { previousVolume = musicPlayer.volume; musicPlayer.volume = 0; muteBtn.innerHTML = "🔈"; }
  else { musicPlayer.volume = previousVolume || 0.5; muteBtn.innerHTML = "🔇"; }
});

musicPlayer.addEventListener('timeupdate', () => {
  if (musicPlayer.duration) scrubber.value = (musicPlayer.currentTime / musicPlayer.duration) * 100;
});
scrubber.addEventListener('input', () => {
  if (musicPlayer.duration) musicPlayer.currentTime = (scrubber.value / 100) * musicPlayer.duration;
});

function highlightActiveTrack() {
  trackItems.forEach((item, index) => item.classList.toggle('active', index === currentTrack));
}

if (playPauseBtn && volUpBtn && volDownBtn && muteBtn && prevBtn && nextBtn && musicPlayer && musicList && scrubber && songImg) {
  // ...music player setup code...
}
