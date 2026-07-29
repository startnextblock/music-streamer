// Generates a local root CA and a leaf certificate (signed by that CA) for
// `localhost` + every non-internal IPv4 address on this machine, entirely
// with a pure-JS crypto library. This replaces vite-plugin-mkcert, whose
// binary download is blocked on this network — the trust model is the same:
// install certs/rootCA.pem on the phone once, and the leaf cert becomes
// trusted for LAN HTTPS. Needed because Chrome only allows Service Worker
// registration / "Add to Home Screen" installs on localhost or a trusted
// HTTPS origin, not plain http://<lan-ip>.
import selfsigned from 'selfsigned';
import { networkInterfaces } from 'node:os';
import { writeFileSync, mkdirSync } from 'node:fs';

function lanIPv4Addresses() {
  const addrs = [];
  for (const iface of Object.values(networkInterfaces())) {
    for (const net of iface ?? []) {
      if (net.family === 'IPv4' && !net.internal) addrs.push(net.address);
    }
  }
  return addrs;
}

const ips = ['127.0.0.1', ...lanIPv4Addresses()];
const altNames = [
  { type: 2, value: 'localhost' }, // type 2 = DNS
  ...ips.map((ip) => ({ type: 7, ip })), // type 7 = IP
];

mkdirSync('certs', { recursive: true });

const tenYears = new Date();
tenYears.setFullYear(tenYears.getFullYear() + 10);

const twoYears = new Date();
twoYears.setFullYear(twoYears.getFullYear() + 2);

// Root CA: self-signed, marked as a CA, long-lived.
const ca = await selfsigned.generate([{ name: 'commonName', value: 'Music Streamer Local Dev CA' }], {
  keySize: 2048,
  notAfterDate: tenYears,
  extensions: [
    { name: 'basicConstraints', cA: true, critical: true },
    { name: 'keyUsage', keyCertSign: true, cRLSign: true, critical: true },
  ],
});

// Leaf cert: signed by the CA above, valid for the actual hosts we serve on.
const leaf = await selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
  keySize: 2048,
  notAfterDate: twoYears,
  extensions: [
    { name: 'basicConstraints', cA: false, critical: true },
    { name: 'keyUsage', digitalSignature: true, keyEncipherment: true, critical: true },
    { name: 'extKeyUsage', serverAuth: true },
    { name: 'subjectAltName', altNames },
  ],
  ca: { key: ca.private, cert: ca.cert },
});

writeFileSync('certs/rootCA.pem', ca.cert);
writeFileSync('certs/rootCA-key.pem', ca.private);
writeFileSync('certs/cert.pem', leaf.cert);
writeFileSync('certs/key.pem', leaf.private);

console.log('Detected LAN IPv4 addresses:', ips.join(', '));
console.log('Wrote certs/rootCA.pem, certs/cert.pem, certs/key.pem');
