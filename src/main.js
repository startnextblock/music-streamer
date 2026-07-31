import './style.css';
import { parseBlob } from 'music-metadata';
import { getAllTracks, saveTrack, deleteTrack, getAllPlaylists, savePlaylist, deletePlaylist } from './db.js';
import { registerSW } from 'virtual:pwa-register';
import Sortable from 'sortablejs';

registerSW({ immediate: true });

// ---- DOM refs ----
const el = (id) => document.getElementById(id);
const libraryEl = el('library');
const trackListEl = el('track-list');
const emptyStateEl = el('empty-state');
const searchEmptyStateEl = el('search-empty-state');
const appTitleEl = el('app-title');
const searchEl = el('search');
const searchBtn = el('search-btn');
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
const themeToggle = el('theme-toggle');
const accentPreviewEl = el('accent-preview');
const hueTrackArea = el('hue-track-area');
const hueThumb = el('hue-thumb');
const colorSquareWrapEl = el('color-square-wrap');
const colorSquareEl = el('color-square');
const colorSquareThumbEl = el('color-square-thumb');
const importSheet = el('import-sheet');
const importSheetBackdrop = el('import-sheet-backdrop');
const importFilesOption = el('import-files-option');
const importFolderOption = el('import-folder-option');
const importCancelBtn = el('import-cancel');

const sidebarEl = el('sidebar');
const sidebarCollapseBtn = el('sidebar-collapse-btn');
const sidebarSongsEl = el('sidebar-songs');
const sidebarSongsIconEl = el('sidebar-songs-icon');
const sidebarAlbumsEl = el('sidebar-albums');
const sidebarAlbumsIconEl = el('sidebar-albums-icon');
const sidebarArtistsEl = el('sidebar-artists');
const sidebarArtistsIconEl = el('sidebar-artists-icon');
const albumListEl = el('album-list');
const artistListEl = el('artist-list');
const trackListHeaderEl = el('track-list-header');
const sidebarPlaylistsHeaderEl = el('sidebar-playlists-header');
const sidebarPlaylistsIconEl = el('sidebar-playlists-icon');
const sidebarNewPlaylistBtn = el('sidebar-new-playlist-btn');
const sidebarPlaylistListEl = el('sidebar-playlist-list');

const libraryRootEl = el('library-root');
const libraryRootListEl = el('library-root-list');
const subHeaderEl = el('sub-header');
const subBackBtn = el('sub-back-btn');
const subBackIconEl = el('sub-back-icon');
const subBackLabelEl = el('sub-back-label');
const subTitleEl = el('sub-title');
const subSubtitleEl = el('sub-subtitle');
const subActionBtn = el('sub-action-btn');
const playlistListEl = el('playlist-list');
const playlistsEmptyStateEl = el('playlists-empty-state');
const playlistEmptyStateEl = el('playlist-empty-state');
const actionAddToPlaylistBtn = el('action-add-to-playlist');
const actionRemoveFromPlaylistBtn = el('action-remove-from-playlist');
const newPlaylistSheet = el('new-playlist-sheet');
const newPlaylistSheetBackdrop = el('new-playlist-sheet-backdrop');
const newPlaylistNameInput = el('new-playlist-name-input');
const newPlaylistCreateBtn = el('new-playlist-create-btn');
const newPlaylistCancelBtn = el('new-playlist-cancel-btn');
const playlistActionSheet = el('playlist-action-sheet');
const playlistActionSheetBackdrop = el('playlist-action-sheet-backdrop');
const playlistActionRenameBtn = el('playlist-action-rename');
const playlistActionDeleteBtn = el('playlist-action-delete');
const playlistActionCancelBtn = el('playlist-action-cancel');
const playlistPickerSheet = el('playlist-picker-sheet');
const playlistPickerSheetBackdrop = el('playlist-picker-sheet-backdrop');
const playlistPickerListEl = el('playlist-picker-list');
const playlistPickerNewBtn = el('playlist-picker-new-btn');
const playlistPickerCloseBtn = el('playlist-picker-close-btn');
const addTracksSheet = el('add-tracks-sheet');
const addTracksSheetBackdrop = el('add-tracks-sheet-backdrop');
const addTracksListEl = el('add-tracks-list');
const addTracksCloseBtn = el('add-tracks-close-btn');
const playlistActionCoverBtn = el('playlist-action-cover');
const playlistCoverInput = el('playlist-cover-input');
const editTrackSheet = el('edit-track-sheet');
const editTrackSheetBackdrop = el('edit-track-sheet-backdrop');
const editTrackTitleInput = el('edit-track-title-input');
const editTrackArtistInput = el('edit-track-artist-input');
const editTrackSaveBtn = el('edit-track-save-btn');
const editTrackCancelBtn = el('edit-track-cancel-btn');
const songsSortBtn = el('songs-sort-btn');
const songsSortLabelEl = el('songs-sort-label');
const songsSortChevronEl = el('songs-sort-chevron');
const sortSheet = el('sort-sheet');
const sortSheetBackdrop = el('sort-sheet-backdrop');
const sortCancelBtn = el('sort-cancel-btn');
const sortOptionBtns = document.querySelectorAll('.sort-option');
const subHeaderActionsEl = el('sub-header-actions');
const subPlayBtn = el('sub-play-btn');
const subShuffleBtn = el('sub-shuffle-btn');
const subPlayIconEl = el('sub-play-icon');
const subShuffleIconEl = el('sub-shuffle-icon');
const exportLibraryBtn = el('export-library-btn');
const importLibraryBtn = el('import-library-btn');
const backupFileInput = el('backup-file-input');
const geminiApiKeyInput = el('gemini-api-key-input');
const aiCleanupToggle = el('ai-cleanup-toggle');
const aiCleanupExistingBtn = el('ai-cleanup-existing-btn');
const aiCleanupProgressEl = el('ai-cleanup-progress');
const aiCleanupProgressFillEl = el('ai-cleanup-progress-fill');
const aiCleanupProgressTextEl = el('ai-cleanup-progress-text');
const aiCleanupSheet = el('ai-cleanup-sheet');
const aiCleanupSheetBackdrop = el('ai-cleanup-sheet-backdrop');
const aiCleanupListEl = el('ai-cleanup-list');
const aiCleanupApplyBtn = el('ai-cleanup-apply-btn');
const aiCleanupSkipBtn = el('ai-cleanup-skip-btn');

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
let currentVal = 90;
let activeQueue = []; // current play queue (unshuffled), whatever list play was triggered from

let playlists = []; // { id, name, trackIds: [], order }
let currentView = 'root'; // 'root' | 'songs' | 'albums' | 'album-detail' | 'artists' | 'artist-detail' | 'playlists' | 'playlist-detail'
let currentPlaylistId = null;
let currentAlbumName = null;
let currentArtistName = null;
let currentDetailQueue = []; // whatever list the sub-header's Play/Shuffle buttons should act on — refreshed by whichever detail view last rendered
let songsSortMode = localStorage.getItem('songsSortMode') || 'custom'; // 'custom' | 'title' | 'artist' | 'recent' — a display-only resort, never touches the stored manual `order`

const SORT_LABELS = { custom: 'Custom Order', title: 'Title', artist: 'Artist', recent: 'Date Added' };

let geminiApiKey = localStorage.getItem('geminiApiKey') || '';
let aiCleanupEnabled = localStorage.getItem('aiCleanupEnabled') === 'true';
let pendingAiSuggestions = []; // [{ trackId, oldTitle, oldArtist, newTitle, newArtist }] awaiting review in the AI cleanup sheet
// 'gemini-flash-latest' is Google's stable rolling alias for its current
// recommended flash model, rather than a specific dated version like
// 'gemini-2.5-flash' — pinning to a specific version risks a 404 for any
// API key/account that doesn't have that exact model enabled, which is
// exactly what happened during testing.
const GEMINI_MODEL = 'gemini-flash-latest';
let actionSheetPlaylistId = null;
let playlistActionId = null; // playlist targeted by the playlist row's own action sheet
let playlistPickerTrackId = null; // track targeted by the "Add to Playlist" sheet
let pendingPickerTrackId = null; // remembers to reopen the picker after creating a playlist from within it
let coverTargetPlaylistId = null; // playlist awaiting a cover image pick
let editTrackId = null; // track targeted by the edit-song sheet
let searchActive = false; // whether the topbar's search field is expanded (in place of the app title)
const coverUrlCache = new Map(); // playlistId -> object URL, kept alive for the session, revoked on delete/replace

// Hand-drawn SF Symbols-style icons (stroke/fill, no external font/CDN) so
// controls read as crisp vector glyphs instead of inconsistent emoji.
const ICONS = {
  shuffle:
    '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4-4 4"/><path d="M3 17h5.5a3 3 0 0 0 2.4-1.2L15 8"/><path d="M3 7h5.5a3 3 0 0 1 2.4 1.2L12 11"/><path d="M17 21l4-4-4-4"/><path d="M13 13l1.5 2.3A3 3 0 0 0 17 16.5H21"/></svg>',
  prev: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><rect x="5" y="5" width="2.3" height="14" rx="1"/><path d="M18.4 5.2a1 1 0 0 1 1.5.85v11.9a1 1 0 0 1-1.5.85l-9.5-5.95a1 1 0 0 1 0-1.7z"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><rect x="16.7" y="5" width="2.3" height="14" rx="1"/><path d="M5.6 5.2a1 1 0 0 0-1.5.85v11.9a1 1 0 0 0 1.5.85l9.5-5.95a1 1 0 0 0 0-1.7z"/></svg>',
  // The path's true bounding box — traced from its own coordinates — spans
  // x=[8, 20.43], center 14.2, which sits 2.2 units right of the 24-wide
  // viewBox's center (12). Shifted left by exactly that amount so the
  // shape's actual geometric center lands in the middle of the button
  // (pause's symmetric bars need no such correction).
  play: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5.14a1 1 0 0 1 1.53-.85l10.9 6.86a1 1 0 0 1 0 1.7l-10.9 6.86A1 1 0 0 1 8 18.86z" transform="translate(-2.2, 0)"/></svg>',
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
  gear: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  chevron:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  search:
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  note: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  album:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>',
  sidebarToggle:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>',
  artist:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6"/></svg>',
  list: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
};

init();

function applySidebarCollapsed(collapsed) {
  if (collapsed) document.documentElement.setAttribute('data-sidebar', 'collapsed');
  else document.documentElement.removeAttribute('data-sidebar');
  localStorage.setItem('sidebarCollapsed', String(collapsed));
  sidebarCollapseBtn.title = collapsed ? 'Expand Sidebar' : 'Collapse Sidebar';
}

function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeToggle.classList.toggle('active', theme === 'dark');
  themeToggle.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1d21' : '#e0e5ec');
  updateAccentTextToken();
}

// The accent itself is tuned to read well as a FILL (buttons, the seek
// track, active-state highlights) against both themes' surfaces. Used
// directly as TEXT, though, it fails WCAG AA in light mode — a mid-brightness
// amber against a light background just doesn't have enough luminance gap.
// This derives a separate --accent-text token: dark mode's surfaces are
// dark enough that the plain accent already passes as text, so it's just
// aliased; light mode gets a deliberately darkened variant (same hue/
// saturation the user picked, lower value) that still reads as "the accent
// color" but clears 4.5:1 against light backgrounds. Re-run whenever the
// accent OR the theme changes, since either one can invalidate it.
function updateAccentTextToken() {
  if (getTheme() === 'light') {
    const [r, g, b] = hsvToRgb(currentHue, currentSat, Math.min(currentVal, 55));
    document.documentElement.style.setProperty('--accent-text', `rgb(${r}, ${g}, ${b})`);
  } else {
    document.documentElement.style.setProperty('--accent-text', 'var(--accent)');
  }
}

// Standard HSV->RGB conversion (h: 0-360, s/v: 0-100). HSV (rather than HSL)
// is what maps naturally onto the saturation/brightness square: X = s, Y = v.
function hsvToRgb(h, s, v) {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

// Picks readable text/icon color for whatever accent color is chosen — dark
// colors (low brightness) always need white text; among bright colors, hues
// in the yellow-to-cyan range (and any low-saturation/grayish color) read
// best with dark text, everything else reads best with white. Without this,
// accent buttons could end up with invisible or washed-out text depending on
// what color gets picked.
function computeAccentInk(hue, sat, val) {
  if (val < 55) return '#ffffff';
  const isLightHue = (hue > 25 && hue < 195) || sat < 30;
  return isLightHue ? '#1a1d21' : '#ffffff';
}

function applyAccentFromHSV(hue, sat, val, { persist = true } = {}) {
  currentHue = hue;
  currentSat = sat;
  currentVal = val;
  const [r, g, b] = hsvToRgb(hue, sat, val);
  const ink = computeAccentInk(hue, sat, val);

  document.documentElement.style.setProperty('--accent', `rgb(${r}, ${g}, ${b})`);
  document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
  document.documentElement.style.setProperty('--accent-ink', ink);
  updateAccentTextToken();

  accentPreviewEl.style.background = `rgb(${r}, ${g}, ${b})`;

  // Kept in sync here (the one function every change — drag, keyboard, or
  // initial load — already runs through) so a screen reader announces the
  // current hue/saturation/brightness regardless of how it changed.
  hueTrackArea.setAttribute('aria-valuenow', String(Math.round(hue)));
  colorSquareWrapEl.setAttribute('aria-valuenow', String(Math.round(sat)));
  colorSquareWrapEl.setAttribute('aria-valuetext', `Saturation ${Math.round(sat)}%, brightness ${Math.round(val)}%`);

  if (persist) {
    localStorage.setItem('accentHue', String(hue));
    localStorage.setItem('accentSat', String(sat));
    localStorage.setItem('accentVal', String(val));
  }
}

function updateColorSquareBackground(hue) {
  colorSquareEl.style.background = `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`;
}

function positionThumb(thumbEl, trackEl, percent) {
  const width = trackEl.getBoundingClientRect().width;
  thumbEl.style.transform = `translateX(${percent * width - 11}px)`;
}

function positionSquareThumb() {
  const rect = colorSquareWrapEl.getBoundingClientRect();
  const x = (currentSat / 100) * rect.width;
  const y = (1 - currentVal / 100) * rect.height;
  colorSquareThumbEl.style.transform = `translate(${x - 11}px, ${y - 11}px)`;
}

// The settings sheet starts hidden (display:none), so track widths read as 0
// until it's actually shown — thumb positions must be (re)computed each time
// it opens, after layout has happened (double rAF, matching the reference
// implementation this was adapted from).
function positionAccentThumbs() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      positionThumb(hueThumb, hueTrackArea, currentHue / 360);
      positionSquareThumb();
      updateColorSquareBackground(currentHue);
    });
  });
}

function updateHueFromClientX(clientX) {
  const rect = hueTrackArea.getBoundingClientRect();
  const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
  const hue = Math.round((x / rect.width) * 360);
  hueThumb.style.transform = `translateX(${x - 11}px)`;
  updateColorSquareBackground(hue);
  applyAccentFromHSV(hue, currentSat, currentVal, { persist: false });
}

function clientXFromEvent(e) {
  return e.touches ? e.touches[0].clientX : e.clientX;
}

function clientPointFromEvent(e) {
  const t = e.touches ? e.touches[0] : e;
  return { x: t.clientX, y: t.clientY };
}

function updateSquareFromClientPoint({ x, y }) {
  const rect = colorSquareWrapEl.getBoundingClientRect();
  const px = Math.max(0, Math.min(x - rect.left, rect.width));
  const py = Math.max(0, Math.min(y - rect.top, rect.height));
  const sat = Math.round((px / rect.width) * 100);
  const val = Math.round(100 - (py / rect.height) * 100);
  colorSquareThumbEl.style.transform = `translate(${px - 11}px, ${py - 11}px)`;
  applyAccentFromHSV(currentHue, sat, val, { persist: false });
}

// Shared drag wiring for both accent-color pickers (hue strip and
// saturation/brightness square) — identical mouse/touch/rAF-throttling
// behavior, differing only in what point value gets extracted per event.
function setupPointerDrag(area, extractValue, onMove) {
  let dragging = false;
  let rafId = null;

  const start = (e) => {
    dragging = true;
    onMove(extractValue(e));
  };
  const move = (e) => {
    if (!dragging) return;
    if (rafId) cancelAnimationFrame(rafId);
    const value = extractValue(e);
    rafId = requestAnimationFrame(() => {
      onMove(value);
      rafId = null;
    });
  };
  const end = () => {
    if (!dragging) return;
    dragging = false;
    applyAccentFromHSV(currentHue, currentSat, currentVal);
  };

  area.addEventListener('mousedown', start);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);
  area.addEventListener('touchstart', start, { passive: true });
  document.addEventListener('touchmove', move, { passive: true });
  document.addEventListener('touchend', end);
}

function openSheet(sheetEl) {
  sheetEl.classList.remove('hidden');
}

function closeSheet(sheetEl) {
  sheetEl.classList.add('hidden');
}

function showSettingsSheet() {
  openSheet(settingsSheet);
  positionAccentThumbs();
}

function hideSettingsSheet() {
  closeSheet(settingsSheet);
}

function showSearch() {
  searchActive = true;
  appTitleEl.classList.add('hidden');
  searchEl.classList.remove('hidden');
  searchBtn.innerHTML = ICONS.close;
  searchBtn.title = 'Close search';
  requestAnimationFrame(() => searchEl.focus());
}

function hideSearch() {
  searchActive = false;
  searchEl.classList.add('hidden');
  appTitleEl.classList.remove('hidden');
  searchBtn.innerHTML = ICONS.search;
  searchBtn.title = 'Search';
  if (searchEl.value) {
    searchEl.value = '';
    if (currentView === 'songs') render();
  }
}

function showImportSheet() {
  openSheet(importSheet);
}

function hideImportSheet() {
  closeSheet(importSheet);
}

function showSortSheet() {
  updateSortOptionChecks();
  openSheet(sortSheet);
}

function hideSortSheet() {
  closeSheet(sortSheet);
}

function updateSortOptionChecks() {
  sortOptionBtns.forEach((btn) => {
    const check = btn.querySelector('.playlist-picker-check');
    check.innerHTML = btn.dataset.sort === songsSortMode ? ICONS.check : '';
  });
}

function showAiCleanupSheet() {
  renderAiCleanupList();
  openSheet(aiCleanupSheet);
}

function hideAiCleanupSheet() {
  closeSheet(aiCleanupSheet);
  pendingAiSuggestions = [];
}

function renderAiCleanupList() {
  aiCleanupListEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const s of pendingAiSuggestions) {
    const label = document.createElement('label');
    label.className = 'ai-cleanup-row';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.dataset.trackId = s.trackId;

    const textWrap = document.createElement('div');
    textWrap.className = 'ai-cleanup-row-text';
    const oldEl = document.createElement('div');
    oldEl.className = 'ai-cleanup-old';
    oldEl.textContent = s.oldArtist ? `${s.oldTitle} — ${s.oldArtist}` : s.oldTitle;
    const newEl = document.createElement('div');
    newEl.className = 'ai-cleanup-new';
    newEl.textContent = s.newArtist ? `${s.newTitle} — ${s.newArtist}` : s.newTitle;
    textWrap.append(oldEl, newEl);

    label.append(checkbox, textWrap);
    frag.appendChild(label);
  }
  aiCleanupListEl.appendChild(frag);
}

async function applyAiCleanupSuggestions() {
  const checkedIds = new Set(
    Array.from(aiCleanupListEl.querySelectorAll('input[type="checkbox"]'))
      .filter((cb) => cb.checked)
      .map((cb) => cb.dataset.trackId)
  );
  const toApply = pendingAiSuggestions.filter((s) => checkedIds.has(s.trackId));

  if (!toApply.length) {
    hideAiCleanupSheet();
    showToast('No changes applied');
    return;
  }

  // Progress goes on the button's own label, not the topbar's import-status
  // bar — that bar lives outside this sheet, and the sheet's own backdrop
  // would hide it exactly the way the toast used to be hidden behind an
  // open sheet. Text the user is already looking at is guaranteed visible.
  aiCleanupApplyBtn.disabled = true;
  aiCleanupSkipBtn.disabled = true;

  let applied = 0;
  for (let i = 0; i < toApply.length; i++) {
    aiCleanupApplyBtn.textContent = `Applying ${i + 1} of ${toApply.length}…`;
    const s = toApply[i];
    const track = tracks.find((t) => t.id === s.trackId);
    if (!track) continue;
    track.title = s.newTitle;
    track.artist = s.newArtist;
    const { id, ...record } = track;
    await saveTrack(id, record);
    applied++;
  }

  aiCleanupApplyBtn.disabled = false;
  aiCleanupSkipBtn.disabled = false;
  aiCleanupApplyBtn.textContent = 'Apply Selected';

  hideAiCleanupSheet();
  if (currentView !== 'root') renderLibraryView();
  showToast(applied ? `Updated ${pluralize(applied, 'song')}` : 'No changes applied');
}

// Sends every newly imported track's raw (pre-cleanup) title to Gemini in a
// single batched request — one call per import batch rather than one per
// track, since a personal-library import can easily be dozens of files at
// once and per-track calls would multiply both latency and quota use for no
// benefit. responseSchema (rather than a hand-parsed prompt) is what makes
// the reply reliably parseable JSON instead of "usually valid JSON".
async function cleanupTitlesWithGemini(newTracks) {
  if (!geminiApiKey || !newTracks.length) return;

  setAiCleanupBusy(true, `Cleaning up ${pluralize(newTracks.length, 'title')} with AI…`);
  try {
    await cleanupTitlesWithGeminiInner(newTracks);
  } finally {
    setAiCleanupBusy(false);
  }
}

async function cleanupTitlesWithGeminiInner(newTracks) {
  const items = newTracks.map((t, i) => ({ index: i, rawTitle: t.title, currentArtist: t.artist || '' }));
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text:
              'You clean up messy music file titles for a personal offline music library app. For each entry below, extract a clean song title and the primary performing artist. Strip upload/file noise: "(Official Video)", "(Official Audio)", "(Lyrics)", "[Reprod. ...]" / producer tags, resolution or codec tags, uploader/channel names, and trailing hashtags. Keep genuinely meaningful featured-artist credits in the title (e.g. "feat. X") when that reflects how the song was actually released, rather than stripping them outright. If currentArtist already looks clean and correct, keep it as-is rather than inventing a new one.\n\n' +
              'Respond with ONLY a JSON object of the exact shape {"results":[{"index":number,"title":string,"artist":string}, ...]} — one entry per input, in any order, with no other text.\n\n' +
              'Entries:\n' +
              JSON.stringify(items),
          },
        ],
      },
    ],
    generationConfig: {
      // Deliberately just JSON mode, not a strict responseSchema — the
      // schema's exact accepted field casing/shape turned out to be
      // brittle across models (one combination came back as a flat "invalid
      // argument" 400 with no further detail). Plain JSON mode plus an
      // explicit shape description in the prompt is more broadly supported;
      // the parsing below already treats the result defensively (missing
      // fields/indexes are just skipped) rather than assuming a strict
      // schema was enforced.
      responseMimeType: 'application/json',
    },
  };

  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        // Backstop so a stuck request can never leave the "Cleaning Up…"
        // button spinning forever with no feedback — 30s is generous for a
        // plain-text extraction call; anything past that is hung, not slow.
        signal: AbortSignal.timeout(30000),
      }
    );
  } catch (err) {
    console.error('Gemini request failed', err);
    showToast(err.name === 'TimeoutError' ? 'AI cleanup failed: request timed out' : 'AI cleanup failed: network error');
    return;
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '');
    console.error('Gemini request failed', response.status, bodyText);
    // Google's error body carries the actual reason (e.g. "API key not
    // valid", "model not found") — surfacing that in the toast itself means
    // the next failure is self-diagnosing without needing devtools open.
    let detail = '';
    try {
      detail = JSON.parse(bodyText)?.error?.message || '';
    } catch {
      // body wasn't JSON — fall through with no detail rather than throwing
    }
    showToast(detail ? `AI cleanup failed: ${detail}` : `AI cleanup failed (${response.status})`);
    return;
  }

  let parsed;
  try {
    const data = await response.json();
    parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text ?? '');
  } catch (err) {
    console.error('Failed to parse Gemini response', err);
    showToast('AI cleanup failed: unexpected response');
    return;
  }

  const suggestions = [];
  for (const result of parsed.results || []) {
    const track = newTracks[result.index];
    if (!track) continue;
    const newTitle = (result.title || '').trim();
    const newArtist = (result.artist || '').trim();
    if (!newTitle) continue;
    if (newTitle === track.title && newArtist === (track.artist || '')) continue;
    suggestions.push({ trackId: track.id, oldTitle: track.title, oldArtist: track.artist || '', newTitle, newArtist });
  }

  if (suggestions.length) {
    pendingAiSuggestions = suggestions;
    showAiCleanupSheet();
  } else {
    showToast('AI cleanup: no changes suggested');
  }
}

// The "Clean Up Existing Songs" button in Settings — runs the exact same
// batched pass cleanupTitlesWithGemini already does for fresh imports, just
// against the whole library instead of only what was just added. Tracks
// that already read clean are filtered out inside cleanupTitlesWithGemini
// itself (identical title/artist is skipped there), so re-running this
// repeatedly only ever surfaces what's actually still messy.
async function cleanupExistingLibrary() {
  if (!geminiApiKey) {
    showToast('Add a Gemini API key first');
    return;
  }
  if (!tracks.length) {
    showToast('No songs to clean up');
    return;
  }

  aiCleanupExistingBtn.disabled = true;
  aiCleanupExistingBtn.textContent = 'Cleaning Up…';
  try {
    await cleanupTitlesWithGemini(tracks);
  } finally {
    aiCleanupExistingBtn.disabled = false;
    aiCleanupExistingBtn.textContent = 'Clean Up Existing Songs';
  }
}

// Registry of sheet elements whose Escape-to-dismiss handling is generic —
// adding a new sheet just means adding one entry here, not another
// classList check in the keydown listener below.
const DISMISSIBLE_SHEETS = [
  { el: actionSheet, hide: hideActionSheet },
  { el: settingsSheet, hide: hideSettingsSheet },
  { el: importSheet, hide: hideImportSheet },
  { el: newPlaylistSheet, hide: hideNewPlaylistSheet },
  { el: playlistActionSheet, hide: hidePlaylistActionSheet },
  { el: playlistPickerSheet, hide: hidePlaylistPickerSheet },
  { el: sortSheet, hide: hideSortSheet },
  { el: aiCleanupSheet, hide: hideAiCleanupSheet },
  { el: addTracksSheet, hide: hideAddTracksSheet },
  { el: editTrackSheet, hide: hideEditTrackSheet },
];

async function init() {
  settingsBtn.innerHTML = ICONS.gear;
  addBtn.innerHTML = ICONS.plus;

  applyTheme(getTheme());

  sidebarCollapseBtn.innerHTML = ICONS.sidebarToggle;
  sidebarCollapseBtn.title = document.documentElement.getAttribute('data-sidebar') === 'collapsed' ? 'Expand Sidebar' : 'Collapse Sidebar';
  sidebarCollapseBtn.addEventListener('click', () => {
    applySidebarCollapsed(document.documentElement.getAttribute('data-sidebar') !== 'collapsed');
  });

  // Number(null) is 0, not NaN — reading the raw string first keeps an
  // absent saved value absent instead of it silently passing the range
  // check below as a legitimate "hue 0" and landing on black.
  const rawHue = localStorage.getItem('accentHue');
  const rawSat = localStorage.getItem('accentSat');
  const rawVal = localStorage.getItem('accentVal');
  const storedHue = rawHue === null ? NaN : Number(rawHue);
  const storedSat = rawSat === null ? NaN : Number(rawSat);
  const storedVal = rawVal === null ? NaN : Number(rawVal);
  applyAccentFromHSV(
    Number.isFinite(storedHue) && storedHue >= 0 && storedHue <= 360 ? storedHue : currentHue,
    Number.isFinite(storedSat) && storedSat >= 0 && storedSat <= 100 ? storedSat : currentSat,
    Number.isFinite(storedVal) && storedVal >= 0 && storedVal <= 100 ? storedVal : currentVal,
    { persist: false }
  );

  settingsBtn.addEventListener('click', showSettingsSheet);
  settingsSheetBackdrop.addEventListener('click', hideSettingsSheet);
  settingsCloseBtn.addEventListener('click', hideSettingsSheet);
  themeToggle.addEventListener('click', () => applyTheme(getTheme() === 'dark' ? 'light' : 'dark'));
  setupPointerDrag(hueTrackArea, clientXFromEvent, updateHueFromClientX);
  setupPointerDrag(colorSquareWrapEl, clientPointFromEvent, updateSquareFromClientPoint);

  // Both pickers were mouse/touch-only — a keyboard user couldn't change
  // the accent color at all. Arrow keys step hue and saturation/brightness
  // the same way dragging does, reusing applyAccentFromHSV so persistence
  // and the aria-value* updates stay identical either way.
  hueTrackArea.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 15 : 5;
    let delta = 0;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -step;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = step;
    else if (e.key === 'Home') delta = -currentHue;
    else if (e.key === 'End') delta = 360 - currentHue;
    else return;
    e.preventDefault();
    const hue = Math.max(0, Math.min(360, currentHue + delta));
    applyAccentFromHSV(hue, currentSat, currentVal);
    positionThumb(hueThumb, hueTrackArea, hue / 360);
    updateColorSquareBackground(hue);
  });

  colorSquareWrapEl.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 10 : 4;
    let dSat = 0;
    let dVal = 0;
    if (e.key === 'ArrowLeft') dSat = -step;
    else if (e.key === 'ArrowRight') dSat = step;
    else if (e.key === 'ArrowUp') dVal = step;
    else if (e.key === 'ArrowDown') dVal = -step;
    else return;
    e.preventDefault();
    const sat = Math.max(0, Math.min(100, currentSat + dSat));
    const val = Math.max(0, Math.min(100, currentVal + dVal));
    applyAccentFromHSV(currentHue, sat, val);
    positionSquareThumb();
  });

  if (navigator.storage?.persist) {
    navigator.storage.persist().catch(() => {});
  }
  tracks = await getAllTracks();
  await migrateTrackOrder();
  sortTracks();

  playlists = await getAllPlaylists();
  sortPlaylists();

  subBackIconEl.innerHTML = ICONS.back;

  // The very first render happens before the document's first paint, which
  // is too early for a View Transition (it gets skipped with a rejection) —
  // only subsequent user-triggered navigation should cross-fade.
  renderLibraryViewImmediate();

  sidebarSongsIconEl.innerHTML = ICONS.note;
  sidebarAlbumsIconEl.innerHTML = ICONS.album;
  sidebarArtistsIconEl.innerHTML = ICONS.artist;
  sidebarPlaylistsIconEl.innerHTML = ICONS.list;
  sidebarNewPlaylistBtn.innerHTML = ICONS.plus;
  sidebarSongsEl.addEventListener('click', goToSongs);
  sidebarAlbumsEl.addEventListener('click', goToAlbums);
  sidebarArtistsEl.addEventListener('click', goToArtists);
  sidebarPlaylistsHeaderEl.addEventListener('click', goToPlaylists);
  makeActivatable(sidebarSongsEl, goToSongs, { label: 'Songs' });
  makeActivatable(sidebarAlbumsEl, goToAlbums, { label: 'Albums' });
  makeActivatable(sidebarArtistsEl, goToArtists, { label: 'Artists' });
  makeActivatable(sidebarPlaylistsHeaderEl, goToPlaylists, { label: 'Playlists' });
  sidebarNewPlaylistBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showNewPlaylistSheet();
  });

  songsSortChevronEl.innerHTML = ICONS.chevron;
  songsSortBtn.addEventListener('click', showSortSheet);
  sortSheetBackdrop.addEventListener('click', hideSortSheet);
  sortCancelBtn.addEventListener('click', hideSortSheet);
  sortOptionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      songsSortMode = btn.dataset.sort;
      localStorage.setItem('songsSortMode', songsSortMode);
      songsSortLabelEl.textContent = SORT_LABELS[songsSortMode];
      hideSortSheet();
      if (currentView === 'songs') render();
    });
  });

  subPlayIconEl.innerHTML = ICONS.play;
  subShuffleIconEl.innerHTML = ICONS.shuffle;
  subPlayBtn.addEventListener('click', () => playQueueFromStart(currentDetailQueue));
  subShuffleBtn.addEventListener('click', () => shuffleQueue(currentDetailQueue));

  exportLibraryBtn.addEventListener('click', exportLibrary);
  importLibraryBtn.addEventListener('click', () => backupFileInput.click());
  backupFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    backupFileInput.value = '';
    if (file) importLibraryBackup(file);
  });

  geminiApiKeyInput.value = geminiApiKey;
  geminiApiKeyInput.addEventListener('change', () => {
    geminiApiKey = geminiApiKeyInput.value.trim();
    localStorage.setItem('geminiApiKey', geminiApiKey);
  });
  aiCleanupToggle.classList.toggle('active', aiCleanupEnabled);
  aiCleanupToggle.setAttribute('aria-checked', String(aiCleanupEnabled));
  aiCleanupToggle.addEventListener('click', () => {
    aiCleanupEnabled = !aiCleanupEnabled;
    localStorage.setItem('aiCleanupEnabled', String(aiCleanupEnabled));
    aiCleanupToggle.classList.toggle('active', aiCleanupEnabled);
    aiCleanupToggle.setAttribute('aria-checked', String(aiCleanupEnabled));
  });
  aiCleanupSheetBackdrop.addEventListener('click', hideAiCleanupSheet);
  aiCleanupSkipBtn.addEventListener('click', hideAiCleanupSheet);
  aiCleanupApplyBtn.addEventListener('click', applyAiCleanupSuggestions);
  aiCleanupExistingBtn.addEventListener('click', cleanupExistingLibrary);

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
  searchBtn.innerHTML = ICONS.search;
  searchBtn.addEventListener('click', () => {
    if (currentView !== 'songs') goToSongs();
    if (searchActive) hideSearch();
    else showSearch();
  });
  searchEl.addEventListener('blur', () => {
    if (!searchEl.value.trim()) hideSearch();
  });

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
    showEditTrackSheet(id);
  });
  editTrackSheetBackdrop.addEventListener('click', hideEditTrackSheet);
  editTrackCancelBtn.addEventListener('click', hideEditTrackSheet);
  editTrackSaveBtn.addEventListener('click', saveEditTrack);
  editTrackArtistInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditTrack();
    }
  });
  actionDeleteBtn.addEventListener('click', () => {
    const id = actionSheetTrackId;
    hideActionSheet();
    removeTrack(id);
  });
  actionAddToPlaylistBtn.addEventListener('click', () => {
    const id = actionSheetTrackId;
    hideActionSheet();
    showPlaylistPickerSheet(id);
  });
  actionRemoveFromPlaylistBtn.addEventListener('click', () => {
    const trackId = actionSheetTrackId;
    const playlistId = actionSheetPlaylistId;
    hideActionSheet();
    removeTrackFromPlaylist(playlistId, trackId);
  });

  subBackBtn.addEventListener('click', goBack);

  newPlaylistSheetBackdrop.addEventListener('click', hideNewPlaylistSheet);
  newPlaylistCancelBtn.addEventListener('click', hideNewPlaylistSheet);
  newPlaylistCreateBtn.addEventListener('click', createPlaylist);
  newPlaylistNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createPlaylist();
    }
  });

  playlistActionSheetBackdrop.addEventListener('click', hidePlaylistActionSheet);
  playlistActionCancelBtn.addEventListener('click', hidePlaylistActionSheet);
  playlistActionRenameBtn.addEventListener('click', () => {
    const id = playlistActionId;
    hidePlaylistActionSheet();
    startPlaylistRename(id);
  });
  playlistActionDeleteBtn.addEventListener('click', () => {
    const id = playlistActionId;
    hidePlaylistActionSheet();
    deletePlaylistById(id);
  });
  playlistActionCoverBtn.addEventListener('click', () => {
    coverTargetPlaylistId = playlistActionId;
    hidePlaylistActionSheet();
    playlistCoverInput.click();
  });
  playlistCoverInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    playlistCoverInput.value = '';
    const playlistId = coverTargetPlaylistId;
    coverTargetPlaylistId = null;
    if (!file || !playlistId) return;

    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    revokeCoverUrl(pl.id);
    pl.cover = file;
    await persistPlaylist(pl);
    if (currentView === 'playlists') renderPlaylistsList();
  });

  playlistPickerSheetBackdrop.addEventListener('click', hidePlaylistPickerSheet);
  playlistPickerCloseBtn.addEventListener('click', hidePlaylistPickerSheet);
  playlistPickerNewBtn.addEventListener('click', () => {
    pendingPickerTrackId = playlistPickerTrackId;
    hidePlaylistPickerSheet();
    showNewPlaylistSheet();
  });

  addTracksSheetBackdrop.addEventListener('click', hideAddTracksSheet);
  addTracksCloseBtn.addEventListener('click', hideAddTracksSheet);

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    for (const { el, hide } of DISMISSIBLE_SHEETS) {
      if (!el.classList.contains('hidden')) hide();
    }
  });

  // Desktop transport shortcuts (Space/arrows), matching Music.app's own —
  // skipped entirely while any sheet is open or while typing in a text
  // field/select, and while nothing is loaded (no track to act on yet).
  // Every <input> (including the seek/volume sliders themselves) is
  // excluded via tagName so their own native arrow-key behavior is left
  // alone rather than double-handled here.
  document.addEventListener('keydown', (e) => {
    const target = e.target;
    const isFormField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
    if (isFormField) return;
    if (DISMISSIBLE_SHEETS.some(({ el }) => !el.classList.contains('hidden'))) return;
    if (playerBar.classList.contains('hidden')) return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      playNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      playPrev();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      adjustVolume(5);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      adjustVolume(-5);
    }
  });
}

function showActionSheet(trackId, { context = 'library', playlistId = null } = {}) {
  actionSheetTrackId = trackId;
  actionSheetPlaylistId = playlistId;
  actionRenameBtn.classList.toggle('hidden', context === 'playlist');
  actionDeleteBtn.classList.toggle('hidden', context === 'playlist');
  actionAddToPlaylistBtn.classList.toggle('hidden', context === 'playlist');
  actionRemoveFromPlaylistBtn.classList.toggle('hidden', context !== 'playlist');
  openSheet(actionSheet);
}

function hideActionSheet() {
  closeSheet(actionSheet);
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

function adjustVolume(deltaPercent) {
  const next = Math.max(0, Math.min(100, Math.round(audio.volume * 100) + deltaPercent));
  audio.volume = next / 100;
  volumeEl.value = next;
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
    const barHeight = playerBar.offsetHeight || 190;
    libraryEl.style.paddingBottom = `${barHeight + 8}px`;
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

function sortPlaylists() {
  playlists.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function nextPlaylistOrderValue() {
  return playlists.length ? Math.max(...playlists.map((p) => p.order ?? 0)) + 1 : 0;
}

async function persistPlaylist(playlist) {
  const { id, ...record } = playlist;
  await savePlaylist(id, record);
}

function showNewPlaylistSheet() {
  newPlaylistNameInput.value = '';
  openSheet(newPlaylistSheet);
  requestAnimationFrame(() => newPlaylistNameInput.focus());
}

function hideNewPlaylistSheet() {
  closeSheet(newPlaylistSheet);
  pendingPickerTrackId = null;
}

async function createPlaylist() {
  const name = newPlaylistNameInput.value.trim();
  if (!name) return;

  const id = generateId();
  const record = { name, trackIds: [], cover: null, order: nextPlaylistOrderValue() };
  await savePlaylist(id, record);
  playlists.push({ id, ...record });
  sortPlaylists();
  newPlaylistSheet.classList.add('hidden');

  if (pendingPickerTrackId) {
    const trackId = pendingPickerTrackId;
    pendingPickerTrackId = null;
    await toggleTrackInPlaylist(id, trackId);
    showPlaylistPickerSheet(trackId);
  } else if (currentView === 'playlists') {
    renderPlaylistsList();
  }
  renderSidebar();
  showToast(`Created "${name}"`);
}

function showPlaylistActionSheet(id) {
  playlistActionId = id;
  openSheet(playlistActionSheet);
}

function hidePlaylistActionSheet() {
  closeSheet(playlistActionSheet);
  playlistActionId = null;
}

function startPlaylistRename(playlistId) {
  const pl = playlists.find((p) => p.id === playlistId);
  const card = playlistListEl.querySelector(`.playlist-card[data-id="${playlistId}"]`);
  const titleEl = card?.querySelector('.playlist-card-title');
  if (!pl || !titleEl) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'playlist-card-rename-input';
  input.value = pl.name;
  input.maxLength = 100;
  titleEl.replaceWith(input);
  input.focus();
  input.select();
  input.addEventListener('click', (e) => e.stopPropagation());

  let settled = false;
  const commit = async () => {
    if (settled) return;
    settled = true;
    const newName = input.value.trim();
    if (newName && newName !== pl.name) {
      pl.name = newName;
      await persistPlaylist(pl);
    }
    renderPlaylistsList();
    renderSidebar();
  };

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur();
    } else if (e.key === 'Escape') {
      settled = true;
      renderPlaylistsList();
    }
  });
}

async function deletePlaylistById(id) {
  await deletePlaylist(id);
  revokeCoverUrl(id);
  playlists = playlists.filter((p) => p.id !== id);
  if (currentPlaylistId === id) closePlaylistDetail();
  else renderPlaylistsList();
  renderSidebar();
}

function getCoverUrl(playlist) {
  if (!playlist.cover) return null;
  let url = coverUrlCache.get(playlist.id);
  if (!url) {
    url = URL.createObjectURL(playlist.cover);
    coverUrlCache.set(playlist.id, url);
  }
  return url;
}

function revokeCoverUrl(id) {
  const url = coverUrlCache.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    coverUrlCache.delete(id);
  }
}

function showPlaylistPickerSheet(trackId) {
  playlistPickerTrackId = trackId;
  renderPlaylistPickerList(trackId);
  openSheet(playlistPickerSheet);
}

function hidePlaylistPickerSheet() {
  closeSheet(playlistPickerSheet);
  playlistPickerTrackId = null;
}

function renderPlaylistPickerList(trackId) {
  playlistPickerListEl.innerHTML = '';
  if (!playlists.length) {
    const empty = document.createElement('p');
    empty.className = 'settings-label';
    empty.textContent = 'No playlists yet.';
    playlistPickerListEl.appendChild(empty);
    return;
  }
  for (const pl of playlists) {
    playlistPickerListEl.appendChild(buildPickerRow(pl, trackId, () => toggleTrackInPlaylist(pl.id, trackId).then(() => renderPlaylistPickerList(trackId))));
  }
}

function showAddTracksSheet(playlistId) {
  renderAddTracksList(playlistId);
  openSheet(addTracksSheet);
}

function hideAddTracksSheet() {
  closeSheet(addTracksSheet);
}

function renderAddTracksList(playlistId) {
  const pl = playlists.find((p) => p.id === playlistId);
  addTracksListEl.innerHTML = '';
  if (!tracks.length) {
    const empty = document.createElement('p');
    empty.className = 'settings-label';
    empty.textContent = 'Your library is empty.';
    addTracksListEl.appendChild(empty);
    return;
  }
  for (const track of tracks) {
    addTracksListEl.appendChild(
      buildPickerRow({ id: playlistId, name: track.title, trackIds: pl?.trackIds || [] }, track.id, async () => {
        await toggleTrackInPlaylist(playlistId, track.id);
        renderAddTracksList(playlistId);
        if (currentView === 'playlist-detail') renderPlaylistDetail();
      })
    );
  }
}

// Shared row builder for both the "Add to Playlist" picker (rows = playlists,
// checked if the given track is already a member) and the "Add Songs" picker
// (rows = tracks, checked if already a member of the given playlist).
function buildPickerRow(entry, memberId, onToggle) {
  const btn = document.createElement('button');
  btn.className = 'sheet-btn playlist-picker-row';
  const nameSpan = document.createElement('span');
  nameSpan.textContent = entry.name;
  btn.appendChild(nameSpan);
  if (entry.trackIds.includes(memberId)) {
    const check = document.createElement('span');
    check.className = 'playlist-picker-check';
    check.innerHTML = ICONS.check;
    btn.appendChild(check);
  }
  btn.addEventListener('click', onToggle);
  return btn;
}

async function toggleTrackInPlaylist(playlistId, trackId) {
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return;
  const idx = pl.trackIds.indexOf(trackId);
  if (idx === -1) pl.trackIds.push(trackId);
  else pl.trackIds.splice(idx, 1);
  await persistPlaylist(pl);
  if (currentView === 'playlists') renderPlaylistsList();
}

async function removeTrackFromPlaylist(playlistId, trackId) {
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return;
  pl.trackIds = pl.trackIds.filter((id) => id !== trackId);
  await persistPlaylist(pl);
  if (currentView === 'playlist-detail' && currentPlaylistId === playlistId) renderPlaylistDetail();
}

function goToSongs() {
  currentView = 'songs';
  renderLibraryView();
}

function goToPlaylists() {
  currentView = 'playlists';
  renderLibraryView();
}

function goToAlbums() {
  currentView = 'albums';
  renderLibraryView();
}

function goToArtists() {
  currentView = 'artists';
  renderLibraryView();
}

function openAlbumDetail(name) {
  currentAlbumName = name;
  currentView = 'album-detail';
  renderLibraryView();
}

function openArtistDetail(name) {
  currentArtistName = name;
  currentView = 'artist-detail';
  renderLibraryView();
}

// Groups the full library by album/artist, falling back to the same
// "Unknown Album"/"Unknown Artist" label used for individual track rows so
// untagged files still land in a single browsable bucket instead of being
// split across a blank-named group per file.
function groupTracksBy(field) {
  const fallback = field === 'album' ? 'Unknown Album' : 'Unknown Artist';
  const map = new Map();
  for (const t of tracks) {
    const key = (t[field] || '').trim() || fallback;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(t);
  }
  return map;
}

function openPlaylistDetail(id) {
  currentPlaylistId = id;
  currentView = 'playlist-detail';
  renderLibraryView();
}

function closePlaylistDetail() {
  currentPlaylistId = null;
  currentView = 'playlists';
  renderLibraryView();
}

function goBack() {
  if (currentView === 'playlist-detail') closePlaylistDetail();
  else if (currentView === 'album-detail') {
    currentAlbumName = null;
    currentView = 'albums';
    renderLibraryView();
  } else if (currentView === 'artist-detail') {
    currentArtistName = null;
    currentView = 'artists';
    renderLibraryView();
  } else {
    currentView = 'root';
    renderLibraryView();
  }
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
  const newlyImportedTracks = [];

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
        addedAt: Date.now(),
      };
      await saveTrack(id, record);
      const newTrack = { id, ...record };
      tracks.push(newTrack);
      newlyImportedTracks.push(newTrack);
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

  const summary = [`Imported ${pluralize(imported, 'song')}`];
  if (duplicates) summary.push(`${duplicates} already in library`);
  if (failed) summary.push(`${failed} failed`);
  if (skippedCount) summary.push(`${skippedCount} skipped (not audio)`);
  showToast(summary.join(' · '));

  // Fire-and-forget: cleanupTitlesWithGemini handles its own errors/toasts
  // and only opens the review sheet if it actually has suggestions, so the
  // import flow above doesn't need to wait on it.
  if (aiCleanupEnabled && geminiApiKey && newlyImportedTracks.length) {
    cleanupTitlesWithGemini(newlyImportedTracks);
  }
}

// ---- backup / restore ----
// The library lives only in this browser's IndexedDB — there's no server
// copy, no original files kept around to re-import from. A backup is a
// single JSON file with every track's metadata AND its audio (base64, since
// JSON can't hold binary directly) plus every playlist, including cover
// images. Deliberately not a zip: this app already avoids adding
// dependencies where the platform can do the job (no CDN fonts, no build
// tooling beyond Vite itself), and at the personal-library scale this app
// targets, one JSON file with embedded base64 is simpler to reason about
// than introducing a zip library for what's fundamentally one export button.
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64, mimeType) {
  const byteChars = atob(base64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

async function exportLibrary() {
  if (!tracks.length && !playlists.length) {
    showToast('Nothing to export yet');
    return;
  }

  setImporting(true);
  importText.textContent = 'Preparing export…';
  importBarFill.style.width = '0%';

  const manifest = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tracks: [],
    playlists: [],
  };

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    importBarFill.style.width = `${Math.round((i / tracks.length) * 100)}%`;
    importText.textContent = `Preparing ${i + 1} of ${tracks.length}: ${t.title}`;
    manifest.tracks.push({
      id: t.id,
      name: t.name,
      title: t.title,
      artist: t.artist,
      album: t.album,
      duration: t.duration,
      order: t.order,
      addedAt: t.addedAt,
      mimeType: t.blob.type || 'audio/mpeg',
      audioBase64: await blobToBase64(t.blob),
    });
  }

  for (const p of playlists) {
    const entry = { id: p.id, name: p.name, trackIds: p.trackIds, order: p.order };
    if (p.cover) {
      entry.coverMimeType = p.cover.type || 'image/jpeg';
      entry.coverBase64 = await blobToBase64(p.cover);
    }
    manifest.playlists.push(entry);
  }

  importBarFill.style.width = '100%';
  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `music-streamer-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  setImporting(false);
  showToast(`Exported ${pluralize(tracks.length, 'song')} · ${pluralize(playlists.length, 'playlist')}`);
}

async function importLibraryBackup(file) {
  let manifest;
  try {
    manifest = JSON.parse(await file.text());
    if (!Array.isArray(manifest.tracks)) throw new Error('missing tracks array');
  } catch (err) {
    console.error('Invalid backup file', err);
    showToast("That file isn't a valid backup");
    return;
  }

  setImporting(true);
  let imported = 0;
  let duplicates = 0;
  let failed = 0;
  let orderCounter = nextOrderValue();
  const knownSignatures = new Set(tracks.map((t) => `${t.name}|${t.blob.size}`));
  const idMap = new Map(); // backup's old track id -> this restore's new id, so playlists can be remapped afterward

  const backupTracks = manifest.tracks;
  for (let i = 0; i < backupTracks.length; i++) {
    const bt = backupTracks[i];
    importBarFill.style.width = `${Math.round((i / backupTracks.length) * 100)}%`;
    importText.textContent = `Restoring ${i + 1} of ${backupTracks.length}: ${bt.title}`;

    try {
      const blob = base64ToBlob(bt.audioBase64, bt.mimeType || 'audio/mpeg');
      const signature = `${bt.name}|${blob.size}`;
      if (knownSignatures.has(signature)) {
        duplicates++;
        continue;
      }
      const id = generateId();
      idMap.set(bt.id, id);
      const record = {
        name: bt.name,
        title: bt.title,
        artist: bt.artist || '',
        album: bt.album || '',
        duration: bt.duration || null,
        blob,
        order: orderCounter++,
        addedAt: bt.addedAt || Date.now(),
      };
      await saveTrack(id, record);
      tracks.push({ id, ...record });
      knownSignatures.add(signature);
      imported++;
    } catch (err) {
      console.error('Failed to restore', bt.title, err);
      failed++;
    }
  }
  sortTracks();

  let restoredPlaylists = 0;
  let playlistOrderCounter = nextPlaylistOrderValue();
  for (const bp of manifest.playlists || []) {
    const trackIds = bp.trackIds.map((oldId) => idMap.get(oldId)).filter(Boolean);
    const id = generateId();
    const record = {
      name: bp.name,
      trackIds,
      cover: bp.coverBase64 ? base64ToBlob(bp.coverBase64, bp.coverMimeType || 'image/jpeg') : null,
      order: playlistOrderCounter++,
    };
    await savePlaylist(id, record);
    playlists.push({ id, ...record });
    restoredPlaylists++;
  }
  sortPlaylists();

  importBarFill.style.width = '100%';
  setImporting(false);
  renderLibraryView();

  const summary = [`Restored ${pluralize(imported, 'song')}`];
  if (restoredPlaylists) summary.push(pluralize(restoredPlaylists, 'playlist'));
  if (duplicates) summary.push(`${duplicates} already in library`);
  if (failed) summary.push(`${failed} failed`);
  showToast(summary.join(' · '));
}

function setImporting(isImporting) {
  addBtn.disabled = isImporting;
  importStatus.classList.toggle('hidden', !isImporting);
  if (isImporting) importBarFill.style.width = '0%';
}

// Drives two copies of the same progress bar at once — the topbar's
// import-status strip and a second one inline in the Settings sheet's AI
// Cleanup section (see style.css) — as an indeterminate animation, since a
// single batched Gemini request has no discrete steps to report progress
// against. Both are updated unconditionally rather than picking one based
// on "which context was this called from": whichever one is actually
// on-screen is the one that matters, and the other stays harmlessly hidden
// behind whatever's covering it. This is what fixes cleanup appearing to
// do nothing when triggered from Settings — the topbar bar alone is
// invisible behind the still-open settings sheet, the same bug class the
// toast z-index fix addressed for toast notifications.
function setAiCleanupBusy(isBusy, label) {
  const text = label || 'Cleaning up titles with AI…';

  importStatus.classList.toggle('hidden', !isBusy);
  importBarFill.classList.toggle('indeterminate', isBusy);
  aiCleanupProgressEl.classList.toggle('hidden', !isBusy);
  aiCleanupProgressFillEl.classList.toggle('indeterminate', isBusy);

  if (isBusy) {
    // Clears any inline width left over from a prior run (e.g. "100%" from
    // the last completed batch) — an inline style would otherwise outrank
    // .indeterminate's own width:30% in the cascade and the sliding segment
    // would silently render full-width instead.
    importBarFill.style.width = '';
    importText.textContent = text;
    aiCleanupProgressFillEl.style.width = '';
    aiCleanupProgressTextEl.textContent = text;
  } else {
    importBarFill.style.width = '0%';
    aiCleanupProgressFillEl.style.width = '0%';
  }
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

function pluralize(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

// Every clickable row in this app (track rows, nav rows, playlist cards,
// sidebar items) is a plain <div>/<li> with only a click listener — none of
// them were reachable or activatable from the keyboard. This is the one
// piece of wiring every one of them needs: a tab stop, a role a screen
// reader announces as interactive, and Enter/Space triggering the same
// handler a click would.
function makeActivatable(element, onActivate, { label } = {}) {
  element.tabIndex = 0;
  element.setAttribute('role', 'button');
  if (label) element.setAttribute('aria-label', label);
  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onActivate(e);
  });
}

// ---- rendering ----
// Top-level dispatcher across the library's navigation stack: a root screen
// (Songs / Playlists as grouped rows, Apple Music Library-tab style), the
// flat song list, the playlist list, and a single playlist's track list.
// Keeping this as one switchboard (rather than scattering view checks
// through render()) is what lets back-navigation stay a simple state + re-render.
// Wrapped in a View Transition (when supported) so switching between these
// screens cross-fades instead of snapping instantly.
function renderLibraryView() {
  // Skipped transitions (e.g. document not visible yet) reject their
  // promises asynchronously rather than throwing synchronously — this is
  // pure progressive enhancement, so those rejections are swallowed rather
  // than surfacing as unhandled-rejection noise.
  if (document.startViewTransition && document.visibilityState === 'visible') {
    const transition = document.startViewTransition(() => renderLibraryViewImmediate());
    transition.ready.catch(() => {});
    transition.finished.catch(() => {});
    transition.updateCallbackDone.catch(() => {});
    return;
  }
  renderLibraryViewImmediate();
}

function renderLibraryViewImmediate() {
  const isRoot = currentView === 'root';
  const isSongs = currentView === 'songs';
  const isPlaylists = currentView === 'playlists';
  const isDetail = currentView === 'playlist-detail';
  const isAlbums = currentView === 'albums';
  const isArtists = currentView === 'artists';
  const isAlbumDetail = currentView === 'album-detail';
  const isArtistDetail = currentView === 'artist-detail';
  const isTrackListView = isSongs || isDetail || isAlbumDetail || isArtistDetail;

  libraryRootEl.classList.toggle('hidden', !isRoot);
  subHeaderEl.classList.toggle('hidden', isRoot);
  if (!isSongs && searchActive) hideSearch();

  trackListEl.classList.toggle('hidden', !isTrackListView);
  trackListHeaderEl.classList.toggle('hidden', !isTrackListView);
  playlistListEl.classList.toggle('hidden', !isPlaylists);
  albumListEl.classList.toggle('hidden', !isAlbums);
  artistListEl.classList.toggle('hidden', !isArtists);
  emptyStateEl.classList.add('hidden');
  searchEmptyStateEl.classList.add('hidden');
  playlistsEmptyStateEl.classList.add('hidden');
  playlistEmptyStateEl.classList.add('hidden');
  songsSortBtn.classList.toggle('hidden', !isSongs);
  subHeaderActionsEl.classList.add('hidden'); // re-shown by whichever detail branch below has tracks to act on

  renderSidebar();

  if (isRoot) {
    renderLibraryRoot();
    return;
  }

  if (isSongs) {
    subBackLabelEl.textContent = 'Library';
    subTitleEl.textContent = 'Songs';
    subSubtitleEl.textContent = trackListSummary(tracks);
    subActionBtn.classList.add('hidden');
    songsSortLabelEl.textContent = SORT_LABELS[songsSortMode];
    render();
  } else if (isPlaylists) {
    subBackLabelEl.textContent = 'Library';
    subTitleEl.textContent = 'Playlists';
    subSubtitleEl.textContent = pluralize(playlists.length, 'playlist');
    subActionBtn.classList.remove('hidden');
    subActionBtn.title = 'New playlist';
    subActionBtn.innerHTML = ICONS.plus;
    subActionBtn.onclick = showNewPlaylistSheet;
    if (sortable) sortable.option('disabled', true);
    renderPlaylistsList();
  } else if (isAlbums) {
    subBackLabelEl.textContent = 'Library';
    subTitleEl.textContent = 'Albums';
    subSubtitleEl.textContent = pluralize(groupTracksBy('album').size, 'album');
    subActionBtn.classList.add('hidden');
    emptyStateEl.classList.toggle('hidden', tracks.length > 0);
    renderGroupList(albumListEl, 'album', openAlbumDetail);
  } else if (isArtists) {
    subBackLabelEl.textContent = 'Library';
    subTitleEl.textContent = 'Artists';
    subSubtitleEl.textContent = pluralize(groupTracksBy('artist').size, 'artist');
    subActionBtn.classList.add('hidden');
    emptyStateEl.classList.toggle('hidden', tracks.length > 0);
    renderGroupList(artistListEl, 'artist', openArtistDetail);
  } else if (isAlbumDetail) {
    subBackLabelEl.textContent = 'Albums';
    subActionBtn.classList.add('hidden');
    if (sortable) sortable.option('disabled', true);
    renderGroupDetail('album', currentAlbumName);
  } else if (isArtistDetail) {
    subBackLabelEl.textContent = 'Artists';
    subActionBtn.classList.add('hidden');
    if (sortable) sortable.option('disabled', true);
    renderGroupDetail('artist', currentArtistName);
  } else {
    subBackLabelEl.textContent = 'Playlists';
    subActionBtn.classList.remove('hidden');
    subActionBtn.title = 'Add songs';
    subActionBtn.innerHTML = ICONS.plus;
    subActionBtn.onclick = () => showAddTracksSheet(currentPlaylistId);
    if (sortable) sortable.option('disabled', true);
    renderPlaylistDetail();
  }
}

function renderSidebar() {
  const songsActive = currentView === 'root' || currentView === 'songs';
  sidebarSongsEl.classList.toggle('active', songsActive);
  sidebarAlbumsEl.classList.toggle('active', currentView === 'albums' || currentView === 'album-detail');
  sidebarArtistsEl.classList.toggle('active', currentView === 'artists' || currentView === 'artist-detail');
  sidebarPlaylistsHeaderEl.classList.toggle('active', currentView === 'playlists');

  sidebarPlaylistListEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const pl of playlists) {
    const li = document.createElement('li');
    li.className = 'sidebar-playlist-item';
    li.classList.toggle('active', currentView === 'playlist-detail' && currentPlaylistId === pl.id);
    li.textContent = pl.name;
    li.title = pl.name;
    li.addEventListener('click', () => openPlaylistDetail(pl.id));
    makeActivatable(li, () => openPlaylistDetail(pl.id), { label: pl.name });
    frag.appendChild(li);
  }
  sidebarPlaylistListEl.appendChild(frag);
}

function renderLibraryRoot() {
  libraryRootListEl.innerHTML = '';
  libraryRootListEl.appendChild(buildNavRow('Songs', tracks.length, goToSongs));
  libraryRootListEl.appendChild(buildNavRow('Albums', groupTracksBy('album').size, goToAlbums));
  libraryRootListEl.appendChild(buildNavRow('Artists', groupTracksBy('artist').size, goToArtists));
  libraryRootListEl.appendChild(buildNavRow('Playlists', playlists.length, goToPlaylists));
}

// Shared renderer for the Albums and Artists group lists — each row is a
// group name + track count, reusing the same nav-row look as the Library
// root screen's Songs/Playlists rows.
function renderGroupList(listEl, field, onOpen) {
  listEl.innerHTML = '';
  const groups = groupTracksBy(field);
  const names = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));
  const frag = document.createDocumentFragment();
  for (const name of names) {
    frag.appendChild(buildNavRow(name, groups.get(name).length, () => onOpen(name)));
  }
  listEl.appendChild(frag);
}

// Shared renderer for a single album's or artist's track list — reuses
// renderTrackRow with context 'library' since these are real library tracks
// (rename/delete/add-to-playlist all apply), just filtered to one group.
function renderGroupDetail(field, name) {
  const fallback = field === 'album' ? 'Unknown Album' : 'Unknown Artist';
  const groupTracks = tracks.filter((t) => ((t[field] || '').trim() || fallback) === name);
  subTitleEl.textContent = name;
  subSubtitleEl.textContent = trackListSummary(groupTracks);

  currentDetailQueue = groupTracks;
  subHeaderActionsEl.classList.toggle('hidden', groupTracks.length === 0);

  trackListEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const track of groupTracks) {
    frag.appendChild(renderTrackRow(track, { context: 'library', queue: groupTracks }));
  }
  trackListEl.appendChild(frag);
}

function trackListSummary(tracksArr) {
  const totalSeconds = tracksArr.reduce((sum, t) => sum + (t.duration || 0), 0);
  return `${pluralize(tracksArr.length, 'song')} · ${formatDurationLong(totalSeconds)}`;
}

function formatDurationLong(totalSeconds) {
  const totalMinutes = Math.round(totalSeconds / 60);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`;
}

function buildNavRow(label, count, onClick) {
  const li = document.createElement('li');
  li.className = 'track-row lib-nav-row';

  const titleEl = document.createElement('span');
  titleEl.className = 'lib-nav-label';
  titleEl.textContent = label;

  const countEl = document.createElement('span');
  countEl.className = 'lib-nav-count';
  countEl.textContent = String(count);

  const chevron = document.createElement('span');
  chevron.className = 'lib-nav-chevron';
  chevron.innerHTML = ICONS.chevron;

  li.append(titleEl, countEl, chevron);
  li.addEventListener('click', onClick);
  makeActivatable(li, onClick, { label });
  return li;
}

// Re-sorts a copy for display only — never touches the stored `order` field,
// so switching back to "Custom Order" restores exactly the manual
// arrangement the user left it in, drag-reorder included.
function sortForDisplay(list) {
  if (songsSortMode === 'title') return [...list].sort((a, b) => a.title.localeCompare(b.title));
  if (songsSortMode === 'artist') {
    return [...list].sort(
      (a, b) => (a.artist || 'Unknown Artist').localeCompare(b.artist || 'Unknown Artist') || a.title.localeCompare(b.title)
    );
  }
  if (songsSortMode === 'recent') return [...list].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  return list;
}

function render() {
  const query = searchEl.value.trim().toLowerCase();
  visibleTracks = query
    ? tracks.filter((t) => [t.title, t.artist, t.album].some((s) => (s || '').toLowerCase().includes(query)))
    : tracks;

  emptyStateEl.classList.toggle('hidden', tracks.length > 0);
  searchEmptyStateEl.classList.toggle('hidden', !query || visibleTracks.length > 0);

  // Dragging to reorder only makes sense against the full, unfiltered
  // library in its stored manual order — a search filter or a non-custom
  // sort mode both mean what's on screen no longer maps cleanly back to it.
  trackListEl.classList.toggle('searching', !!query);
  if (sortable) sortable.option('disabled', !!query || songsSortMode !== 'custom');

  const displayTracks = sortForDisplay(visibleTracks);

  trackListEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const track of displayTracks) {
    frag.appendChild(renderTrackRow(track, { queue: displayTracks }));
  }
  trackListEl.appendChild(frag);
}

function renderPlaylistsList() {
  playlistListEl.innerHTML = '';
  playlistsEmptyStateEl.classList.toggle('hidden', playlists.length > 0);
  if (currentView === 'playlists') subSubtitleEl.textContent = pluralize(playlists.length, 'playlist');
  const frag = document.createDocumentFragment();
  for (const pl of playlists) {
    frag.appendChild(renderPlaylistCard(pl));
  }
  playlistListEl.appendChild(frag);
}

function renderPlaylistCard(playlist) {
  const li = document.createElement('li');
  li.className = 'playlist-card';
  li.dataset.id = playlist.id;

  const cover = document.createElement('div');
  cover.className = 'playlist-card-cover';
  const coverUrl = getCoverUrl(playlist);
  if (coverUrl) cover.style.backgroundImage = `url(${coverUrl})`;

  const moreBtn = document.createElement('button');
  moreBtn.className = 'playlist-card-more';
  moreBtn.innerHTML = ICONS.more;
  moreBtn.title = 'Playlist options';
  moreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showPlaylistActionSheet(playlist.id);
  });

  const info = document.createElement('div');
  info.className = 'playlist-card-info';
  const titleEl = document.createElement('div');
  titleEl.className = 'playlist-card-title';
  titleEl.textContent = playlist.name;
  const countEl = document.createElement('div');
  countEl.className = 'playlist-card-count';
  countEl.textContent = pluralize(playlist.trackIds.length, 'song');
  info.append(titleEl, countEl);

  li.append(cover, moreBtn, info);
  li.addEventListener('click', () => openPlaylistDetail(playlist.id));
  makeActivatable(li, () => openPlaylistDetail(playlist.id), { label: playlist.name });
  return li;
}

function renderPlaylistDetail() {
  const pl = playlists.find((p) => p.id === currentPlaylistId);
  if (!pl) {
    closePlaylistDetail();
    return;
  }
  subTitleEl.textContent = pl.name;

  const byId = new Map(tracks.map((t) => [t.id, t]));
  const plTracks = pl.trackIds.map((id) => byId.get(id)).filter(Boolean);

  // Prune ids for tracks that were deleted from the library since being added.
  if (plTracks.length !== pl.trackIds.length) {
    pl.trackIds = plTracks.map((t) => t.id);
    persistPlaylist(pl);
  }

  subSubtitleEl.textContent = trackListSummary(plTracks);
  playlistEmptyStateEl.classList.toggle('hidden', plTracks.length > 0);

  currentDetailQueue = plTracks;
  subHeaderActionsEl.classList.toggle('hidden', plTracks.length === 0);

  trackListEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const track of plTracks) {
    frag.appendChild(renderTrackRow(track, { context: 'playlist', queue: plTracks }));
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

function renderTrackRow(track, { context = 'library', queue = visibleTracks } = {}) {
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

  const albumEl = document.createElement('span');
  albumEl.className = 'track-album';
  albumEl.textContent = track.album || '';

  const duration = document.createElement('span');
  duration.className = 'track-duration';
  duration.textContent = formatTime(track.duration);

  const moreBtn = document.createElement('button');
  moreBtn.className = 'track-more';
  moreBtn.innerHTML = ICONS.more;
  moreBtn.title = 'Song options';
  moreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (context === 'playlist') showActionSheet(track.id, { context: 'playlist', playlistId: currentPlaylistId });
    else showActionSheet(track.id, { context: 'library' });
  });

  li.append(meta, albumEl, duration, moreBtn);
  li.addEventListener('click', () => playTrackById(track.id, queue));
  makeActivatable(li, () => playTrackById(track.id, queue), { label: `${track.title} by ${track.artist || 'Unknown Artist'}` });
  return li;
}

function showEditTrackSheet(trackId) {
  const track = tracks.find((t) => t.id === trackId);
  if (!track) return;
  editTrackId = trackId;
  editTrackTitleInput.value = track.title;
  editTrackArtistInput.value = track.artist || '';
  openSheet(editTrackSheet);
  requestAnimationFrame(() => editTrackTitleInput.focus());
}

function hideEditTrackSheet() {
  closeSheet(editTrackSheet);
  editTrackId = null;
}

async function saveEditTrack() {
  const track = tracks.find((t) => t.id === editTrackId);
  if (!track) {
    hideEditTrackSheet();
    return;
  }

  track.title = editTrackTitleInput.value.trim() || track.title;
  track.artist = editTrackArtistInput.value.trim();
  const { id, ...record } = track;
  await saveTrack(id, record);
  hideEditTrackSheet();
  render();

  if (currentTrackId === track.id) {
    npTitle.textContent = track.title;
    npArtist.textContent = track.artist || 'Unknown Artist';
    updateMediaSessionMetadata(track);
  }
}

async function removeTrack(id) {
  await deleteTrack(id);
  tracks = tracks.filter((t) => t.id !== id);

  const affected = playlists.filter((p) => p.trackIds.includes(id));
  for (const pl of affected) {
    pl.trackIds = pl.trackIds.filter((tid) => tid !== id);
  }
  await Promise.all(affected.map(persistPlaylist));

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
  return shuffle && shuffleOrder ? shuffleOrder : activeQueue;
}

function playTrackById(id, queue = visibleTracks) {
  const track = queue.find((t) => t.id === id) || tracks.find((t) => t.id === id);
  if (!track) return;

  activeQueue = queue;
  if (shuffle) {
    shuffleOrder = buildShuffleOrder(queue, id);
  }

  currentTrackId = id;

  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = URL.createObjectURL(track.blob);
  audio.src = currentObjectUrl;
  audio.play().catch(() => {});
  seek.value = 0;
  updateSeekFill(0);

  updateNowPlayingUI(track);
  savePlaybackState();

  document.querySelectorAll('.track-row').forEach((r) => {
    r.classList.toggle('playing', r.dataset.id === id);
  });
}

function updateNowPlayingUI(track) {
  playerBar.classList.remove('hidden');
  syncLibraryPadding();
  npTitle.textContent = track.title;
  npArtist.textContent = track.artist || 'Unknown Artist';
  updateMediaSessionMetadata(track);
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
  updateRepeatUI();

  const track = tracks.find((t) => t.id === saved.trackId);
  if (!track) return;

  currentTrackId = track.id;
  activeQueue = tracks;
  if (shuffle) shuffleOrder = buildShuffleOrder(activeQueue, track.id);

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

  updateNowPlayingUI(track);
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

// The sub-header's Play/Shuffle buttons on Album/Artist/Playlist detail
// screens — Play always starts at the front of the list in its displayed
// order (so it turns shuffle off if it was on from a previous session);
// Shuffle turns shuffle on and hands playTrackById a random starting track,
// which is what makes playTrackById itself rebuild shuffleOrder against
// this specific queue.
function playQueueFromStart(queue) {
  if (!queue.length) return;
  if (shuffle) toggleShuffle();
  playTrackById(queue[0].id, queue);
}

function shuffleQueue(queue) {
  if (!queue.length) return;
  if (!shuffle) toggleShuffle();
  const randomTrack = queue[Math.floor(Math.random() * queue.length)];
  playTrackById(randomTrack.id, queue);
}

function togglePlay() {
  if (!currentTrackId) {
    if (visibleTracks.length) playTrackById(visibleTracks[0].id, visibleTracks);
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
  shuffleOrder = shuffle && currentTrackId ? buildShuffleOrder(activeQueue, currentTrackId) : null;
  savePlaybackState();
}

function updateRepeatUI() {
  repeatBtn.innerHTML = repeatMode === 'one' ? ICONS.repeatOne : ICONS.repeat;
  repeatBtn.classList.toggle('active', repeatMode !== 'off');
}

function cycleRepeat() {
  repeatMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
  updateRepeatUI();
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
