import { createStore, entries, set, del } from 'idb-keyval';

// Dedicated IndexedDB store so we don't collide with anything else on-device.
const store = createStore('music-streamer-db', 'tracks');

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
