import './style.css';
import { parseBlob } from 'music-metadata';
import { getAllTracks, saveTrack, deleteTrack } from './db.js';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

// ---- DOM refs ----
const el = (id) => document.getElementById(id);
const trackListEl = el('track-list');
const emptyStateEl = el('empty-state');
const searchEl = el('search');
const addFilesBtn = el('add-files-btn');
const addFolderBtn = el('add-folder-btn');
const fileInput = el('file-input');
const folderInput = el('folder-input');
const audio = el('audio');
const playerBar = el('player-bar');
const npArt = el('np-art');
const npTitle = el('np-title');
const npArtist = el('np-artist');
const seek = el('seek');
const timeCurrent = el('time-current');
const timeTotal = el('time-total');
const playBtn = el('play-btn');
const prevBtn = el('prev-btn');
const nextBtn = el('next-btn');
const shuffleBtn = el('shuffle-btn');
const repeatBtn = el('repeat-btn');

// ---- state ----
let tracks = []; // full library, sorted
let visibleTracks = []; // after search filter; also the base play queue
let currentTrackId = null;
let currentObjectUrl = null;
const artUrlCache = new Map(); // trackId -> object URL, for thumbnails + now-playing art
let shuffleOrder = null; // ordered id list used when shuffle is on
let shuffle = false;
let repeatMode = 'off'; // 'off' | 'all' | 'one'
let seekDragging = false;

const REPEAT_ICONS = { off: '🔁', all: '🔁', one: '🔂' };

init();

async function init() {
  if (navigator.storage?.persist) {
    navigator.storage.persist().catch(() => {});
  }
  tracks = await getAllTracks();
  sortTracks();
  render();

  addFilesBtn.addEventListener('click', () => fileInput.click());
  addFolderBtn.addEventListener('click', () => folderInput.click());
  fileInput.addEventListener('change', (e) => importFiles(e.target.files));
  folderInput.addEventListener('change', (e) => importFiles(e.target.files));
  searchEl.addEventListener('input', () => render());

  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', playPrev);
  nextBtn.addEventListener('click', playNext);
  shuffleBtn.addEventListener('click', toggleShuffle);
  repeatBtn.addEventListener('click', cycleRepeat);

  audio.addEventListener('timeupdate', onTimeUpdate);
  audio.addEventListener('loadedmetadata', onLoadedMetadata);
  audio.addEventListener('ended', onEnded);
  audio.addEventListener('play', () => (playBtn.textContent = '⏸'));
  audio.addEventListener('pause', () => (playBtn.textContent = '▶'));

  seek.addEventListener('input', () => {
    seekDragging = true;
  });
  seek.addEventListener('change', () => {
    if (audio.duration) {
      audio.currentTime = (seek.value / 1000) * audio.duration;
    }
    seekDragging = false;
  });
}

function sortTracks() {
  tracks.sort(
    (a, b) =>
      (a.artist || '').localeCompare(b.artist || '') ||
      (a.album || '').localeCompare(b.album || '') ||
      (a.title || '').localeCompare(b.title || '')
  );
}

// ---- import ----
async function importFiles(fileList) {
  const files = Array.from(fileList).filter(isAudioFile);
  if (!files.length) return;

  for (const file of files) {
    try {
      const meta = await parseBlob(file).catch(() => null);
      const common = meta?.common ?? {};
      const format = meta?.format ?? {};
      const picture = common.picture?.[0];
      const artwork = picture ? new Blob([picture.data], { type: picture.format }) : null;

      const id = crypto.randomUUID();
      const record = {
        name: file.name,
        title: common.title || stripExtension(file.name),
        artist: common.artist || 'Unknown artist',
        album: common.album || '',
        duration: format.duration || null,
        artwork,
        blob: file,
      };
      await saveTrack(id, record);
      tracks.push({ id, ...record });
    } catch (err) {
      console.error('Failed to import', file.name, err);
    }
  }

  sortTracks();
  render();
  fileInput.value = '';
  folderInput.value = '';
}

function isAudioFile(file) {
  if (file.type && file.type.startsWith('audio/')) return true;
  return /\.(mp3|flac|m4a|aac|ogg|oga|wav|opus|wma)$/i.test(file.name);
}

function stripExtension(name) {
  return name.replace(/\.[^/.]+$/, '');
}

// ---- rendering ----
function render() {
  const query = searchEl.value.trim().toLowerCase();
  visibleTracks = query
    ? tracks.filter((t) => [t.title, t.artist, t.album].some((s) => (s || '').toLowerCase().includes(query)))
    : tracks;

  emptyStateEl.style.display = tracks.length ? 'none' : 'block';

  // Revoke thumbnail URLs that have scrolled out of the current view/filter.
  for (const [id, url] of artUrlCache) {
    if (id !== currentTrackId && !visibleTracks.some((t) => t.id === id)) {
      URL.revokeObjectURL(url);
      artUrlCache.delete(id);
    }
  }

  trackListEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const track of visibleTracks) {
    frag.appendChild(renderTrackRow(track));
  }
  trackListEl.appendChild(frag);
}

function artUrlFor(track) {
  if (!track.artwork) return '';
  if (artUrlCache.has(track.id)) return artUrlCache.get(track.id);
  const url = URL.createObjectURL(track.artwork);
  artUrlCache.set(track.id, url);
  return url;
}

function renderTrackRow(track) {
  const li = document.createElement('li');
  li.className = 'track-row' + (track.id === currentTrackId ? ' playing' : '');
  li.dataset.id = track.id;

  const img = document.createElement('img');
  img.className = 'track-art';
  img.src = artUrlFor(track) || blankArtDataUri();
  img.alt = '';

  const meta = document.createElement('div');
  meta.className = 'track-meta';
  const titleEl = document.createElement('div');
  titleEl.className = 'track-title';
  titleEl.textContent = track.title;
  const artistEl = document.createElement('div');
  artistEl.className = 'track-artist';
  artistEl.textContent = track.artist;
  meta.append(titleEl, artistEl);

  const duration = document.createElement('span');
  duration.className = 'track-duration';
  duration.textContent = formatTime(track.duration);

  const del = document.createElement('button');
  del.className = 'track-delete';
  del.textContent = '✕';
  del.title = 'Remove from library';
  del.addEventListener('click', (e) => {
    e.stopPropagation();
    removeTrack(track.id);
  });

  li.append(img, meta, duration, del);
  li.addEventListener('click', () => playTrackById(track.id));
  return li;
}

function blankArtDataUri() {
  return (
    'data:image/svg+xml;base64,' +
    btoa('<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44"><rect width="44" height="44" fill="#1c1a27"/></svg>')
  );
}

async function removeTrack(id) {
  await deleteTrack(id);
  tracks = tracks.filter((t) => t.id !== id);
  if (currentTrackId === id) {
    audio.pause();
    audio.removeAttribute('src');
    currentTrackId = null;
    playerBar.classList.add('hidden');
  }
  render();
}

// ---- playback ----
function currentQueue() {
  return shuffle && shuffleOrder ? shuffleOrder : visibleTracks;
}

function playTrackById(id) {
  const track = visibleTracks.find((t) => t.id === id) || tracks.find((t) => t.id === id);
  if (!track) return;

  if (shuffle) {
    shuffleOrder = buildShuffleOrder(visibleTracks, id);
  }

  currentTrackId = id;

  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = URL.createObjectURL(track.blob);
  audio.src = currentObjectUrl;
  audio.play().catch(() => {});

  playerBar.classList.remove('hidden');
  npTitle.textContent = track.title;
  npArtist.textContent = track.artist;
  npArt.src = artUrlFor(track) || blankArtDataUri();

  document.querySelectorAll('.track-row').forEach((r) => {
    r.classList.toggle('playing', r.dataset.id === id);
  });
}

function buildShuffleOrder(list, startId) {
  const rest = list.filter((t) => t.id !== startId);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  const start = list.find((t) => t.id === startId);
  return start ? [start, ...rest] : rest;
}

function togglePlay() {
  if (!currentTrackId) {
    if (visibleTracks.length) playTrackById(visibleTracks[0].id);
    return;
  }
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}

function playNext() {
  const queue = currentQueue();
  const idx = queue.findIndex((t) => t.id === currentTrackId);
  if (idx === -1) return;
  if (idx + 1 < queue.length) {
    playTrackById(queue[idx + 1].id);
  } else if (repeatMode === 'all') {
    playTrackById(queue[0].id);
  } else {
    audio.pause();
  }
}

function playPrev() {
  const queue = currentQueue();
  const idx = queue.findIndex((t) => t.id === currentTrackId);
  if (idx === -1) return;
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  if (idx - 1 >= 0) {
    playTrackById(queue[idx - 1].id);
  } else if (repeatMode === 'all') {
    playTrackById(queue[queue.length - 1].id);
  }
}

function onEnded() {
  if (repeatMode === 'one') {
    audio.currentTime = 0;
    audio.play().catch(() => {});
    return;
  }
  playNext();
}

function toggleShuffle() {
  shuffle = !shuffle;
  shuffleBtn.classList.toggle('active', shuffle);
  shuffleOrder = shuffle && currentTrackId ? buildShuffleOrder(visibleTracks, currentTrackId) : null;
}

function cycleRepeat() {
  repeatMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
  repeatBtn.textContent = REPEAT_ICONS[repeatMode];
  repeatBtn.classList.toggle('active', repeatMode !== 'off');
}

function onLoadedMetadata() {
  timeTotal.textContent = formatTime(audio.duration);
}

function onTimeUpdate() {
  if (seekDragging) return;
  if (audio.duration) {
    seek.value = Math.round((audio.currentTime / audio.duration) * 1000);
  }
  timeCurrent.textContent = formatTime(audio.currentTime);
}

function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
