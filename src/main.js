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
const importStatus = el('import-status');
const importBarFill = el('import-bar-fill');
const importText = el('import-text');
const toast = el('toast');

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

// Hand-drawn SF Symbols-style icons (stroke/fill, no external font/CDN) so
// controls read as crisp vector glyphs instead of inconsistent emoji.
const ICONS = {
  shuffle:
    '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4-4 4"/><path d="M3 17h5.5a3 3 0 0 0 2.4-1.2L15 8"/><path d="M3 7h5.5a3 3 0 0 1 2.4 1.2L12 11"/><path d="M17 21l4-4-4-4"/><path d="M13 13l1.5 2.3A3 3 0 0 0 17 16.5H21"/></svg>',
  prev: '<svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor"><rect x="5" y="5" width="2.3" height="14" rx="1"/><path d="M18.4 5.2a1 1 0 0 1 1.5.85v11.9a1 1 0 0 1-1.5.85l-9.5-5.95a1 1 0 0 1 0-1.7z"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor"><rect x="16.7" y="5" width="2.3" height="14" rx="1"/><path d="M5.6 5.2a1 1 0 0 0-1.5.85v11.9a1 1 0 0 0 1.5.85l9.5-5.95a1 1 0 0 0 0-1.7z"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5.14a1 1 0 0 1 1.53-.85l10.9 6.86a1 1 0 0 1 0 1.7l-10.9 6.86A1 1 0 0 1 8 18.86z"/></svg>',
  pause:
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.3"/><rect x="13.5" y="5" width="4" height="14" rx="1.3"/></svg>',
  repeat:
    '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  repeatOne:
    '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="12" y="15.5" font-size="8" font-family="system-ui, sans-serif" font-weight="700" stroke="none" fill="currentColor" text-anchor="middle">1</text></svg>',
  cross:
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};

init();

async function init() {
  if (navigator.storage?.persist) {
    navigator.storage.persist().catch(() => {});
  }
  tracks = await getAllTracks();
  sortTracks();
  render();

  shuffleBtn.innerHTML = ICONS.shuffle;
  prevBtn.innerHTML = ICONS.prev;
  nextBtn.innerHTML = ICONS.next;
  playBtn.innerHTML = ICONS.play;
  repeatBtn.innerHTML = ICONS.repeat;

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
  audio.addEventListener('play', () => (playBtn.innerHTML = ICONS.pause));
  audio.addEventListener('pause', () => (playBtn.innerHTML = ICONS.play));

  seek.addEventListener('input', () => {
    seekDragging = true;
    updateSeekFill((seek.value / 1000) * 100);
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
  const allFiles = Array.from(fileList);
  const files = allFiles.filter(isAudioFile);
  const skippedCount = allFiles.length - files.length;

  if (!files.length) {
    fileInput.value = '';
    folderInput.value = '';
    showToast(skippedCount ? `No audio files found among ${skippedCount} selected` : 'No files selected');
    return;
  }

  setImporting(true);
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    importBarFill.style.width = `${Math.round((i / files.length) * 100)}%`;
    importText.textContent = `Importing ${i + 1} of ${files.length}: ${file.name}`;

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
      imported++;
    } catch (err) {
      console.error('Failed to import', file.name, err);
      failed++;
    }
  }

  importBarFill.style.width = '100%';
  sortTracks();
  render();
  fileInput.value = '';
  folderInput.value = '';
  setImporting(false);

  const summary = [`Imported ${imported} song${imported === 1 ? '' : 's'}`];
  if (failed) summary.push(`${failed} failed`);
  if (skippedCount) summary.push(`${skippedCount} skipped (not audio)`);
  showToast(summary.join(' · '));
}

function setImporting(isImporting) {
  addFilesBtn.disabled = isImporting;
  addFolderBtn.disabled = isImporting;
  importStatus.classList.toggle('hidden', !isImporting);
  if (isImporting) importBarFill.style.width = '0%';
}

let toastTimer = null;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
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
  del.innerHTML = ICONS.cross;
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
  seek.value = 0;
  updateSeekFill(0);

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
  repeatBtn.innerHTML = repeatMode === 'one' ? ICONS.repeatOne : ICONS.repeat;
  repeatBtn.classList.toggle('active', repeatMode !== 'off');
}

function onLoadedMetadata() {
  timeTotal.textContent = formatTime(audio.duration);
}

function onTimeUpdate() {
  if (seekDragging) return;
  if (audio.duration) {
    const percent = (audio.currentTime / audio.duration) * 100;
    seek.value = Math.round(percent * 10);
    updateSeekFill(percent);
  }
  timeCurrent.textContent = formatTime(audio.currentTime);
}

function updateSeekFill(percent) {
  seek.style.background = `linear-gradient(to right, var(--accent) ${percent}%, var(--border) ${percent}%)`;
}

function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
