const playButtons = document.querySelectorAll('.play-button');
const playerBar = document.getElementById('playerBar');
const nowPlaying = document.getElementById('nowPlaying');
const pausePlayBtn = document.getElementById('pausePlayBtn');
const nextBtn = document.getElementById('nextBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');

let currentAudio = null;
let currentIndex = -1;
const tracks = [];

playButtons.forEach((btn, index) => {
  const audioSrc = btn.getAttribute('data-audio');
  const title = btn.parentElement.querySelector('.music-title').textContent;
  const artist = btn.parentElement.querySelector('.music-artist').textContent;
  tracks.push({ audioSrc, title, artist });

  btn.addEventListener('click', () => {
    playTrack(index);
  });
});

function playTrack(index) {
  const track = tracks[index];
  if (currentAudio) {
    currentAudio.pause();
  }

  currentAudio = new Audio(track.audioSrc);
  currentAudio.play();
  currentIndex = index;

  nowPlaying.textContent = `Now Playing: ${track.title}`;
  playerBar.style.display = 'flex';
  pausePlayBtn.innerHTML = '<i class="fas fa-pause"></i>';

  currentAudio.addEventListener('ended', playNext);
  currentAudio.addEventListener('timeupdate', updateProgress);
}

function updateProgress() {
  if (!currentAudio) return;
  const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
  progressBar.style.width = percent + '%';
}

function playNext() {
  let nextIndex = (currentIndex + 1) % tracks.length;
  playTrack(nextIndex);
}

pausePlayBtn.addEventListener('click', () => {
  if (!currentAudio) return;
  if (currentAudio.paused) {
    currentAudio.play();
    pausePlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    currentAudio.pause();
    pausePlayBtn.innerHTML = '<i class="fas fa-play"></i>';
  }
});

nextBtn.addEventListener('click', playNext);

progressContainer.addEventListener('click', (e) => {
  if (!currentAudio) return;
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  const duration = currentAudio.duration;
  currentAudio.currentTime = (clickX / width) * duration;
});