import './style.css';
import { parseBlob } from 'music-metadata';
import { getAllTracks, saveTrack, deleteTrack } from './db.js';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

// ---- DOM refs ----
const el = (id) => document.getElementById(id);
const libraryEl = el('library');
const trackListEl = el('track-list');
const emptyStateEl = el('empty-state');
const searchEl = el('search');
const addFilesBtn = el('add-files-btn');
const addFolderBtn = el('add-folder-btn');
const fileInput = el('file-input');
const folderInput = el('folder-input');
const audio = el('audio');
const playerBar = el('player-bar');
const npTitle = el('np-title');
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
const actionSheet = el('action-sheet');
const actionSheetBackdrop = el('action-sheet-backdrop');
const actionRenameBtn = el('action-rename');
const actionDeleteBtn = el('action-delete');
const actionCancelBtn = el('action-cancel');
const volumeEl = el('volume');
const volumeBtn = el('volume-btn');

// ---- state ----
let tracks = []; // full library, sorted
let visibleTracks = []; // after search filter; also the base play queue
let currentTrackId = null;
let currentObjectUrl = null;
let shuffleOrder = null; // ordered id list used when shuffle is on
let shuffle = false;
let repeatMode = 'off'; // 'off' | 'all' | 'one'
let seekDragging = false;
let actionSheetTrackId = null;
let previousVolume = 1;

// Hand-drawn SF Symbols-style icons (stroke/fill, no external font/CDN) so
// controls read as crisp vector glyphs instead of inconsistent emoji.
const ICONS = {
  shuffle:
    '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4-4 4"/><path d="M3 17h5.5a3 3 0 0 0 2.4-1.2L15 8"/><path d="M3 7h5.5a3 3 0 0 1 2.4 1.2L12 11"/><path d="M17 21l4-4-4-4"/><path d="M13 13l1.5 2.3A3 3 0 0 0 17 16.5H21"/></svg>',
  prev: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><rect x="5" y="5" width="2.3" height="14" rx="1"/><path d="M18.4 5.2a1 1 0 0 1 1.5.85v11.9a1 1 0 0 1-1.5.85l-9.5-5.95a1 1 0 0 1 0-1.7z"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><rect x="16.7" y="5" width="2.3" height="14" rx="1"/><path d="M5.6 5.2a1 1 0 0 0-1.5.85v11.9a1 1 0 0 0 1.5.85l9.5-5.95a1 1 0 0 0 0-1.7z"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5.14a1 1 0 0 1 1.53-.85l10.9 6.86a1 1 0 0 1 0 1.7l-10.9 6.86A1 1 0 0 1 8 18.86z"/></svg>',
  pause:
    '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.3"/><rect x="13.5" y="5" width="4" height="14" rx="1.3"/></svg>',
  repeat:
    '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  repeatOne:
    '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="12" y="15.5" font-size="8" font-family="system-ui, sans-serif" font-weight="700" stroke="none" fill="currentColor" text-anchor="middle">1</text></svg>',
  more: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>',
  volumeHigh:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19.3 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  volumeMute:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
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
  volumeBtn.innerHTML = ICONS.volumeHigh;

  const storedVolume = localStorage.getItem('volume');
  const savedVolume = storedVolume === null ? NaN : Number(storedVolume);
  audio.volume = Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1 ? savedVolume : 1;
  volumeEl.value = Math.round(audio.volume * 100);
  updateVolumeIcon();

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

  volumeEl.addEventListener('input', () => {
    audio.volume = volumeEl.value / 100;
    localStorage.setItem('volume', String(audio.volume));
    updateVolumeIcon();
  });
  volumeBtn.addEventListener('click', toggleMute);

  window.addEventListener('resize', syncLibraryPadding);

  actionSheetBackdrop.addEventListener('click', hideActionSheet);
  actionCancelBtn.addEventListener('click', hideActionSheet);
  actionRenameBtn.addEventListener('click', () => {
    const id = actionSheetTrackId;
    hideActionSheet();
    startRename(id);
  });
  actionDeleteBtn.addEventListener('click', () => {
    const id = actionSheetTrackId;
    hideActionSheet();
    removeTrack(id);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !actionSheet.classList.contains('hidden')) hideActionSheet();
  });
}

function showActionSheet(trackId) {
  actionSheetTrackId = trackId;
  actionSheet.classList.remove('hidden');
}

function hideActionSheet() {
  actionSheet.classList.add('hidden');
  actionSheetTrackId = null;
}

function toggleMute() {
  if (audio.volume > 0) {
    previousVolume = audio.volume;
    audio.volume = 0;
  } else {
    audio.volume = previousVolume || 1;
  }
  volumeEl.value = Math.round(audio.volume * 100);
  localStorage.setItem('volume', String(audio.volume));
  updateVolumeIcon();
}

function updateVolumeIcon() {
  volumeBtn.innerHTML = audio.volume === 0 ? ICONS.volumeMute : ICONS.volumeHigh;
}

// #player-bar is fixed to the viewport (not flex-in-flow) so Android's
// dynamic toolbar/viewport-height changes during scroll can't drag it out of
// view. That means the scrollable list needs matching bottom padding so its
// last rows aren't hidden underneath the fixed bar.
function syncLibraryPadding() {
  libraryEl.style.paddingBottom = playerBar.classList.contains('hidden') ? '' : `${playerBar.offsetHeight}px`;
}

function sortTracks() {
  tracks.sort((a, b) => (a.album || '').localeCompare(b.album || '') || (a.title || '').localeCompare(b.title || ''));
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

      const id = crypto.randomUUID();
      const record = {
        name: file.name,
        title: common.title || stripExtension(file.name),
        album: common.album || '',
        duration: format.duration || null,
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
    ? tracks.filter((t) => [t.title, t.album].some((s) => (s || '').toLowerCase().includes(query)))
    : tracks;

  emptyStateEl.style.display = tracks.length ? 'none' : 'block';

  trackListEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const track of visibleTracks) {
    frag.appendChild(renderTrackRow(track));
  }
  trackListEl.appendChild(frag);
}

function renderTrackRow(track) {
  const li = document.createElement('li');
  li.className = 'track-row' + (track.id === currentTrackId ? ' playing' : '');
  li.dataset.id = track.id;

  const meta = document.createElement('div');
  meta.className = 'track-meta';
  const titleEl = document.createElement('div');
  titleEl.className = 'track-title';
  titleEl.textContent = track.title;
  meta.append(titleEl);

  const duration = document.createElement('span');
  duration.className = 'track-duration';
  duration.textContent = formatTime(track.duration);

  const moreBtn = document.createElement('button');
  moreBtn.className = 'track-more';
  moreBtn.innerHTML = ICONS.more;
  moreBtn.title = 'Song options';
  moreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showActionSheet(track.id);
  });

  li.append(meta, duration, moreBtn);
  li.addEventListener('click', () => playTrackById(track.id));
  return li;
}

function startRename(trackId) {
  const track = tracks.find((t) => t.id === trackId);
  const row = trackListEl.querySelector(`.track-row[data-id="${trackId}"]`);
  const titleEl = row?.querySelector('.track-title');
  if (!track || !titleEl) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'track-title-input';
  input.value = track.title;
  input.maxLength = 200;
  titleEl.replaceWith(input);
  input.focus();
  input.select();
  input.addEventListener('click', (e) => e.stopPropagation());

  let settled = false;
  const commit = () => {
    if (settled) return;
    settled = true;
    const newTitle = input.value.trim();
    if (newTitle && newTitle !== track.title) {
      renameTrack(trackId, newTitle);
    } else {
      render();
    }
  };

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur();
    } else if (e.key === 'Escape') {
      settled = true;
      render();
    }
  });
}

async function renameTrack(id, newTitle) {
  const track = tracks.find((t) => t.id === id);
  if (!track) return;
  track.title = newTitle;
  const { id: _id, ...record } = track;
  await saveTrack(id, record);
  sortTracks();
  render();
}

async function removeTrack(id) {
  await deleteTrack(id);
  tracks = tracks.filter((t) => t.id !== id);
  if (currentTrackId === id) {
    audio.pause();
    audio.removeAttribute('src');
    currentTrackId = null;
    playerBar.classList.add('hidden');
    syncLibraryPadding();
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
  syncLibraryPadding();
  npTitle.textContent = track.title;

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
