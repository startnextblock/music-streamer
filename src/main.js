import './style.css';
import { parseBlob } from 'music-metadata';
import { getAllTracks, saveTrack, deleteTrack } from './db.js';
import { registerSW } from 'virtual:pwa-register';
import Sortable from 'sortablejs';

registerSW({ immediate: true });

// ---- DOM refs ----
const el = (id) => document.getElementById(id);
const libraryEl = el('library');
const trackListEl = el('track-list');
const emptyStateEl = el('empty-state');
const searchEl = el('search');
const addBtn = el('add-btn');
const fileInput = el('file-input');
const folderInput = el('folder-input');
const audio = el('audio');
const playerBar = el('player-bar');
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
const actionSheet = el('action-sheet');
const actionSheetBackdrop = el('action-sheet-backdrop');
const actionRenameBtn = el('action-rename');
const actionDeleteBtn = el('action-delete');
const actionCancelBtn = el('action-cancel');
const volumeEl = el('volume');
const volumeBtn = el('volume-btn');
const settingsBtn = el('settings-btn');
const settingsSheet = el('settings-sheet');
const settingsSheetBackdrop = el('settings-sheet-backdrop');
const settingsCloseBtn = el('settings-close');
const themeLightBtn = el('theme-light-btn');
const themeDarkBtn = el('theme-dark-btn');
const accentPreviewEl = el('accent-preview');
const hueTrackArea = el('hue-track-area');
const hueThumb = el('hue-thumb');
const satTrackArea = el('sat-track-area');
const satTrack = el('sat-track');
const satThumb = el('sat-thumb');
const importSheet = el('import-sheet');
const importSheetBackdrop = el('import-sheet-backdrop');
const importFilesOption = el('import-files-option');
const importFolderOption = el('import-folder-option');
const importCancelBtn = el('import-cancel');

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
let sortable = null;
let currentHue = 35; // default: amber
let currentSat = 90;

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
  grip: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
  sun: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  moon: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>',
  gear: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
};

init();

function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (themeLightBtn) themeLightBtn.classList.toggle('selected', theme === 'light');
  if (themeDarkBtn) themeDarkBtn.classList.toggle('selected', theme === 'dark');
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1d21' : '#e0e5ec');
}

// Standard HSL->RGB conversion (h: 0-360, s/l: 0-100), used so --accent-rgb
// stays available for the rgba()-based glow/tint effects elsewhere in the CSS.
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// Picks readable text/icon color for whatever accent hue is chosen — hues in
// the yellow-to-cyan range (and any low-saturation/grayish color) read best
// with dark text; everything else (blues, purples, reds) reads best with
// white. Without this, accent buttons could end up with invisible dark-on-dark
// or washed-out white-on-light text depending on what color gets picked.
function computeAccentInk(hue, sat) {
  const isLightHue = (hue > 25 && hue < 195) || sat < 30;
  return isLightHue ? '#1a1d21' : '#ffffff';
}

function applyAccentFromHueSat(hue, sat, { persist = true } = {}) {
  currentHue = hue;
  currentSat = sat;
  const [r, g, b] = hslToRgb(hue, sat, 55);
  const ink = computeAccentInk(hue, sat);

  document.documentElement.style.setProperty('--accent', `rgb(${r}, ${g}, ${b})`);
  document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
  document.documentElement.style.setProperty('--accent-ink', ink);

  accentPreviewEl.style.background = `rgb(${r}, ${g}, ${b})`;
  satTrack.style.background = `linear-gradient(to right, hsl(${hue}, 0%, 55%), hsl(${hue}, 100%, 55%))`;

  if (persist) {
    localStorage.setItem('accentHue', String(hue));
    localStorage.setItem('accentSat', String(sat));
  }
}

function positionThumb(thumbEl, trackEl, percent) {
  const width = trackEl.getBoundingClientRect().width;
  thumbEl.style.transform = `translateX(${percent * width - 11}px)`;
}

// The settings sheet starts hidden (display:none), so track widths read as 0
// until it's actually shown — thumb positions must be (re)computed each time
// it opens, after layout has happened (double rAF, matching the reference
// implementation this was adapted from).
function positionAccentThumbs() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      positionThumb(hueThumb, hueTrackArea, currentHue / 360);
      positionThumb(satThumb, satTrackArea, currentSat / 100);
    });
  });
}

function updateHueFromClientX(clientX) {
  const rect = hueTrackArea.getBoundingClientRect();
  const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
  const hue = Math.round((x / rect.width) * 360);
  hueThumb.style.transform = `translateX(${x - 11}px)`;
  applyAccentFromHueSat(hue, currentSat, { persist: false });
}

function updateSatFromClientX(clientX) {
  const rect = satTrackArea.getBoundingClientRect();
  const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
  const sat = Math.round((x / rect.width) * 100);
  satThumb.style.transform = `translateX(${x - 11}px)`;
  applyAccentFromHueSat(currentHue, sat, { persist: false });
}

function clientXFromEvent(e) {
  return e.touches ? e.touches[0].clientX : e.clientX;
}

function setupColorDrag(trackArea, onMove) {
  let dragging = false;
  let rafId = null;

  const start = (e) => {
    dragging = true;
    onMove(clientXFromEvent(e));
  };
  const move = (e) => {
    if (!dragging) return;
    if (rafId) cancelAnimationFrame(rafId);
    const clientX = clientXFromEvent(e);
    rafId = requestAnimationFrame(() => {
      onMove(clientX);
      rafId = null;
    });
  };
  const end = () => {
    if (!dragging) return;
    dragging = false;
    applyAccentFromHueSat(currentHue, currentSat);
  };

  trackArea.addEventListener('mousedown', start);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);
  trackArea.addEventListener('touchstart', start, { passive: true });
  document.addEventListener('touchmove', move, { passive: true });
  document.addEventListener('touchend', end);
}

function showSettingsSheet() {
  settingsSheet.classList.remove('hidden');
  positionAccentThumbs();
}

function hideSettingsSheet() {
  settingsSheet.classList.add('hidden');
}

function showImportSheet() {
  importSheet.classList.remove('hidden');
}

function hideImportSheet() {
  importSheet.classList.add('hidden');
}

async function init() {
  settingsBtn.innerHTML = ICONS.gear;
  addBtn.innerHTML = ICONS.plus;
  themeLightBtn.innerHTML = `${ICONS.sun}<span>Light</span>`;
  themeDarkBtn.innerHTML = `${ICONS.moon}<span>Dark</span>`;

  applyTheme(getTheme());

  const storedHue = Number(localStorage.getItem('accentHue'));
  const storedSat = Number(localStorage.getItem('accentSat'));
  applyAccentFromHueSat(
    Number.isFinite(storedHue) && storedHue >= 0 && storedHue <= 360 ? storedHue : currentHue,
    Number.isFinite(storedSat) && storedSat >= 0 && storedSat <= 100 ? storedSat : currentSat,
    { persist: false }
  );

  settingsBtn.addEventListener('click', showSettingsSheet);
  settingsSheetBackdrop.addEventListener('click', hideSettingsSheet);
  settingsCloseBtn.addEventListener('click', hideSettingsSheet);
  themeLightBtn.addEventListener('click', () => applyTheme('light'));
  themeDarkBtn.addEventListener('click', () => applyTheme('dark'));
  setupColorDrag(hueTrackArea, updateHueFromClientX);
  setupColorDrag(satTrackArea, updateSatFromClientX);

  if (navigator.storage?.persist) {
    navigator.storage.persist().catch(() => {});
  }
  tracks = await getAllTracks();
  await migrateTrackOrder();
  sortTracks();
  render();

  sortable = Sortable.create(trackListEl, {
    delay: 300,
    delayOnTouchOnly: true,
    animation: 150,
    chosenClass: 'track-row-dragging',
    onEnd: onDragEnd,
  });

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
  updateVolumeFill();

  restorePlaybackState();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) savePlaybackState();
  });

  addBtn.addEventListener('click', showImportSheet);
  importSheetBackdrop.addEventListener('click', hideImportSheet);
  importCancelBtn.addEventListener('click', hideImportSheet);
  importFilesOption.addEventListener('click', () => {
    hideImportSheet();
    fileInput.click();
  });
  importFolderOption.addEventListener('click', () => {
    hideImportSheet();
    folderInput.click();
  });
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
  audio.addEventListener('play', () => {
    playBtn.innerHTML = ICONS.pause;
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
  });
  audio.addEventListener('pause', () => {
    playBtn.innerHTML = ICONS.play;
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    savePlaybackState();
  });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => audio.play().catch(() => {}));
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    navigator.mediaSession.setActionHandler('previoustrack', playPrev);
    navigator.mediaSession.setActionHandler('nexttrack', playNext);
  }

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
    updateVolumeFill();
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
    if (e.key !== 'Escape') return;
    if (!actionSheet.classList.contains('hidden')) hideActionSheet();
    if (!settingsSheet.classList.contains('hidden')) hideSettingsSheet();
    if (!importSheet.classList.contains('hidden')) hideImportSheet();
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
  updateVolumeFill();
}

function updateVolumeIcon() {
  volumeBtn.innerHTML = audio.volume === 0 ? ICONS.volumeMute : ICONS.volumeHigh;
}

// #player-bar is fixed to the viewport (not flex-in-flow) so Android's
// dynamic toolbar/viewport-height changes during scroll can't drag it out of
// view. That means the scrollable list needs matching bottom padding so its
// last rows aren't hidden underneath the fixed bar.
function syncLibraryPadding() {
  if (playerBar.classList.contains('hidden')) {
    libraryEl.style.paddingBottom = '16px';
  } else {
    // The card now floats 16px above the screen edge (plus safe-area) rather
    // than sitting flush against it, so the list needs to clear that gap too,
    // not just the card's own height.
    const barHeight = playerBar.offsetHeight || 190;
    libraryEl.style.paddingBottom = `${barHeight + 32}px`;
  }
}

function sortTracks() {
  tracks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// One-time migration for libraries imported before manual ordering existed:
// gives every track a stable `order` (seeded from the old alphabetical sort)
// so the switch to manual ordering doesn't shuffle an existing library.
async function migrateTrackOrder() {
  if (tracks.every((t) => typeof t.order === 'number')) return;
  tracks.sort((a, b) => (a.album || '').localeCompare(b.album || '') || (a.title || '').localeCompare(b.title || ''));
  await Promise.all(
    tracks.map((t, i) => {
      t.order = i;
      const { id, ...record } = t;
      return saveTrack(id, record);
    })
  );
}

function nextOrderValue() {
  return tracks.length ? Math.max(...tracks.map((t) => t.order ?? 0)) + 1 : 0;
}

// crypto.randomUUID() only exists in secure contexts (HTTPS or localhost
// specifically) — opening the dev server via its LAN IP (e.g. for phone
// testing) is neither, which made every single import fail with no visible
// error beyond a failure count. Falls back to a manually built ID so
// LAN/plain-HTTP testing keeps working.
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // fall through
    }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
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
  let duplicates = 0;
  let orderCounter = nextOrderValue();

  // Cheap dedupe signature (name+size, not a content hash — fast enough to
  // check per-file with no CPU cost) so re-importing an overlapping folder
  // doesn't silently store a second full copy of every song.
  const knownSignatures = new Set(tracks.map((t) => `${t.name}|${t.blob.size}`));

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    importBarFill.style.width = `${Math.round((i / files.length) * 100)}%`;
    importText.textContent = `Importing ${i + 1} of ${files.length}: ${file.name}`;

    const signature = `${file.name}|${file.size}`;
    if (knownSignatures.has(signature)) {
      duplicates++;
      continue;
    }

    try {
      const meta = await parseBlob(file).catch(() => null);
      const common = meta?.common ?? {};
      const format = meta?.format ?? {};

      const id = generateId();
      const record = {
        name: file.name,
        title: common.title || stripExtension(file.name),
        artist: common.artist || '',
        album: common.album || '',
        duration: format.duration || null,
        blob: file,
        order: orderCounter++,
      };
      await saveTrack(id, record);
      tracks.push({ id, ...record });
      knownSignatures.add(signature);
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
  if (duplicates) summary.push(`${duplicates} already in library`);
  if (failed) summary.push(`${failed} failed`);
  if (skippedCount) summary.push(`${skippedCount} skipped (not audio)`);
  showToast(summary.join(' · '));
}

function setImporting(isImporting) {
  addBtn.disabled = isImporting;
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

  // Dragging to reorder only makes sense against the full, unfiltered
  // library — reordering a filtered subset wouldn't map cleanly back to it.
  trackListEl.classList.toggle('searching', !!query);
  if (sortable) sortable.option('disabled', !!query);

  trackListEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const track of visibleTracks) {
    frag.appendChild(renderTrackRow(track));
  }
  trackListEl.appendChild(frag);
}

// Reads the final DOM order directly (rather than trusting SortableJS's
// reported indices) so it stays correct regardless of how the drag resolved.
function onDragEnd() {
  const newOrderIds = Array.from(trackListEl.children)
    .map((li) => li.dataset.id)
    .filter(Boolean);
  const byId = new Map(tracks.map((t) => [t.id, t]));
  const reordered = newOrderIds.map((id) => byId.get(id)).filter(Boolean);
  if (reordered.length !== tracks.length) return;

  reordered.forEach((t, i) => {
    t.order = i;
  });
  tracks = reordered;
  visibleTracks = tracks;

  Promise.all(
    tracks.map((t) => {
      const { id, ...record } = t;
      return saveTrack(id, record);
    })
  ).catch((err) => console.error('Failed to persist new track order', err));
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
  const artistEl = document.createElement('div');
  artistEl.className = 'track-artist';
  artistEl.textContent = track.artist || 'Unknown Artist';
  meta.append(titleEl, artistEl);

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
  npArtist.textContent = track.artist || 'Unknown Artist';
  updateMediaSessionMetadata(track);
  savePlaybackState();

  document.querySelectorAll('.track-row').forEach((r) => {
    r.classList.toggle('playing', r.dataset.id === id);
  });
}

function updateMediaSessionMetadata(track) {
  if (!('mediaSession' in navigator)) return;
  const base = import.meta.env.BASE_URL;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: 'Music Streamer',
    artwork: [
      { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
    ],
  });
}

// ---- resume-on-reopen ----
function savePlaybackState() {
  const state = {
    trackId: currentTrackId,
    position: audio.currentTime || 0,
    shuffle,
    repeatMode,
  };
  localStorage.setItem('playback-state', JSON.stringify(state));
}

function restorePlaybackState() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem('playback-state') || 'null');
  } catch {
    saved = null;
  }
  if (!saved) return;

  shuffle = !!saved.shuffle;
  shuffleBtn.classList.toggle('active', shuffle);

  repeatMode = saved.repeatMode === 'all' || saved.repeatMode === 'one' ? saved.repeatMode : 'off';
  repeatBtn.innerHTML = repeatMode === 'one' ? ICONS.repeatOne : ICONS.repeat;
  repeatBtn.classList.toggle('active', repeatMode !== 'off');

  const track = tracks.find((t) => t.id === saved.trackId);
  if (!track) return;

  currentTrackId = track.id;
  if (shuffle) shuffleOrder = buildShuffleOrder(visibleTracks, track.id);

  currentObjectUrl = URL.createObjectURL(track.blob);
  audio.src = currentObjectUrl;
  audio.addEventListener(
    'loadedmetadata',
    () => {
      if (Number.isFinite(saved.position) && saved.position > 0 && saved.position < audio.duration) {
        audio.currentTime = saved.position;
        updateSeekFill((saved.position / audio.duration) * 100);
      }
    },
    { once: true }
  );

  playerBar.classList.remove('hidden');
  syncLibraryPadding();
  npTitle.textContent = track.title;
  npArtist.textContent = track.artist || 'Unknown Artist';
  updateMediaSessionMetadata(track);
  render();
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
  savePlaybackState();
}

function cycleRepeat() {
  repeatMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
  repeatBtn.innerHTML = repeatMode === 'one' ? ICONS.repeatOne : ICONS.repeat;
  repeatBtn.classList.toggle('active', repeatMode !== 'off');
  savePlaybackState();
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
  seek.style.setProperty('--val', percent + '%');
}

function updateVolumeFill() {
  volumeEl.style.setProperty('--val', volumeEl.value + '%');
}

function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
