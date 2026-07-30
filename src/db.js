import { createStore, entries, set, del } from 'idb-keyval';

// Dedicated IndexedDB store so we don't collide with anything else on-device.
const store = createStore('music-streamer-db', 'tracks');

// Separate database (not just a second object store) so adding playlists
// doesn't require an IndexedDB version bump/migration on the existing
// tracks store — idb-keyval's createStore always opens at version 1.
const playlistStore = createStore('music-streamer-playlists-db', 'playlists');

export async function getAllTracks() {
  const all = await entries(store);
  return all.map(([id, value]) => ({ id, ...value }));
}

export async function saveTrack(id, track) {
  await set(id, track, store);
}

export async function deleteTrack(id) {
  await del(id, store);
}

export async function getAllPlaylists() {
  const all = await entries(playlistStore);
  return all.map(([id, value]) => ({ id, ...value }));
}

export async function savePlaylist(id, playlist) {
  await set(id, playlist, playlistStore);
}

export async function deletePlaylist(id) {
  await del(id, playlistStore);
}
