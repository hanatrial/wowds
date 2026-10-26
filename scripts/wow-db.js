/* Tarik "Database" + "Database Kabupaten" dari Google Sheet WOW DS → wow_toko_master.js
   (dipakai dashboard.html: WOW_TOKO_MASTER = daftar toko + PIC, WOW_PIC_KAB = PIC → kabupaten).
   Dijalankan terjadwal oleh run.sh (08.00 WITA, Senin–Sabtu).

   Aturan:
   - spasi ganda dirapikan (sheet sering menulis "TK  MAYA"), huruf tidak diubah
   - nama outlet kosong memakai nama Dist 2 / kode (v2), nama kembar diambil satu (yang "Existing" didahulukan)
   - kolom "pair"/tambahan dipertahankan, tapi toko yang tidak ada di sheet dibuang (daftar = Sheet + popup)
   - kalau data mencurigakan (baris/​PIC turun drastis), file tidak ditimpa

   Pakai: node scripts/wow-db.js [--dry]   (--dry = cek saja, tidak menulis) */
const fs = require('fs');
const path = require('path');

const SHEET_ID = '1uSwNeozmwTrfQuR40-D-L4zYXj-OAI8-Uy7tasIqmkY';
const GID_TOKO = '0';             // tab "Database" (tab pertama)
const GID_KAB = '1403688639';      // tab "Database Kabupaten"
const FILE = path.join(__dirname, '..', 'wow_toko_master.js');
const JANJI = path.join(__dirname, '..', '.wow-berubah'); // penanda "ada data berubah, belum di-push"
const DRY = process.argv.includes('--dry');
const GID_PJ = '681014340';        // tab "Database Penjualan"
const FILE_PJ = path.join(__dirname, '..', 'wow_penjualan.js');

const norm = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

/* Unduh dengan retry: koneksi HP ke docs.google.com kadang putus (ECONNRESET).
   Tanpa retry, satu sambungan putus menggagalkan seluruh impor. */
const tidur = (ms) => new Promise((res) => setTimeout(res, ms));
async function fetchRetry(url, opsi = {}, percobaanMaks = 4) {
  let alasan = 'tidak diketahui';
  for (let i = 1; i <= percobaanMaks; i++) {
    try {
      return await fetch(url, opsi);
    } catch (e) {
      alasan = (e && e.cause && e.cause.code) || (e && e.message) || String(e);
      if (i < percobaanMaks) {
        console.warn(`  (percobaan unduh ${i} gagal: ${alasan}) — ulangi dalam ${i * 2} detik`);
        await tidur(i * 2000);
      }
    }
  }
  throw new Error(`Gagal mengunduh setelah ${percobaanMaks} percobaan: ${alasan}`);
}

/* CSV dari Google (export?format=csv) — tanpa pustaka luar. */
function parseCsv(teks) {
  const out = [];
  let baris = [], sel = '', kutip = false;
  for (let i = 0; i < teks.length; i++) {
    const c = teks[i];
    if (kutip) {
      if (c === '"') {
        if (teks[i + 1] === '"') { sel += '"'; i++; } else kutip = false;
      } else sel += c;
    } else if (c === '"') kutip = true;
    else if (c === ',') { baris.push(sel); sel = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && teks[i + 1] === '\n') i++;
      baris.push(sel); out.push(baris); baris = []; sel = '';
    } else sel += c;
  }
  if (sel !== '' || baris.length) { baris.push(sel); out.push(baris); }
  return out.filter((b) => b.some((x) => String(x).trim() !== ''));
}

/* CSV → array objek, pakai baris pertama sebagai nama kolom. */
function keObjek(rows, wajib, namaTab) {
  if (!rows.length) throw new Error(`Tab "${namaTab}" kosong`);
  const kol = rows[0].map((h) => norm(h));
  for (const k of wajib) {
    if (!kol.includes(k)) throw new Error(`Tab "${namaTab}" tidak punya kolom "${k}" — tab/GID berubah?`);
  }
  return rows.slice(1).map((r) => {
    const o = {};
    kol.forEach((k, i) => { if (k) o[k] = r[i] == null ? '' : r[i]; });
    return o;
  });
}

async function ambilCsv(gid, namaTab, wajib) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  const res = await fetchRetry(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Unduh tab "${namaTab}" gagal: HTTP ${res.status}`);
  const teks = await res.text();
  if (/^\s*<(!doctype|html)/i.test(teks)) throw new Error(`Tab "${namaTab}" tidak bisa diunduh (Sheet tidak publik / GID salah)`);
  return keObjek(parseCsv(teks), wajib, namaTab);
}

function bacaLama() {
  try {
    const src = fs.readFileSync(FILE, 'utf8');
    const toko = JSON.parse(src.slice(src.indexOf('['), src.indexOf('];') + 1));
    const kab = JSON.parse(src.slice(src.indexOf('WOW_PIC_KAB = ') + 14).replace(/;\s*$/, ''));
    return { toko, kab };
  } catch (e) {
    return { toko: [], kab: {} };
  }
}

/* Tab "Database Penjualan": per bulan 3 kolom berurutan (PA HILO, PA NS, Sales Value Netto SO).
   Baris judul: [tahun][bulan][label]. Hasil: wow_penjualan.js (dimuat dashboard saat tab Penjualan dibuka). */
async function tarikPenjualan() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_PJ}`;
  const res = await fetchRetry(url, { redirect: 'follow' });
  if (!res.ok) throw new Error('Unduh tab Penjualan gagal: HTTP ' + res.status);
  const teks = await res.text();
  if (/^\s*<(!doctype|html)/i.test(teks)) throw new Error('Tab Penjualan tidak bisa diunduh (Sheet tidak publik / GID salah)');
  const rows = parseCsv(teks);
  const hi = rows.findIndex((r) => norm(r[1]) === 'PIC');
  if (hi < 2) throw new Error('Tab Penjualan: baris judul (PIC) tidak ketemu');
  const H = rows[hi], Mrow = rows[hi - 1], Yrow = rows[hi - 2];
  const BLN = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    januari: 1, februari: 2, maret: 3, mei: 5, juni: 6, juli: 7, agustus: 8, oktober: 10, desember: 12 };
  const num = (x) => { const v = parseFloat(String(x == null ? '' : x).replace(/,/g, '')); return isNaN(v) ? 0 : v; };
  let year = '', mon = 0;
  const cols = [];
  for (let i = 10; i < H.length; i++) {
    if (norm(Yrow[i])) year = norm(Yrow[i]);
    if (norm(Mrow[i])) mon = BLN[norm(Mrow[i]).toLowerCase()] || mon;
    const lb = norm(H[i]).toUpperCase();
    const k = lb === 'PA HILO' ? 0 : lb === 'PA NS' ? 1 : /SALES VALUE/.test(lb) ? 2 : -1;
    if (k < 0 || !year || !mon) continue;
    cols.push({ i, k, ym: year + '-' + String(mon).padStart(2, '0') });
  }
  const bulan = [...new Set(cols.map((c) => c.ym))].sort();
  if (bulan.length < 12) throw new Error('Tab Penjualan: bulan terlalu sedikit (' + bulan.length + ') — dibatalkan');
  const idx = Object.fromEntries(bulan.map((b, j) => [b, j]));
  const data = [];
  for (const r of rows.slice(hi + 1)) {
    const pic = norm(r[1]); if (!pic) continue;
    const n1 = norm(r[5]), n2 = norm(r[6]); const nama = n1 || n2; if (!nama) continue;
    const arr = [0, 1, 2].map(() => Array(bulan.length).fill(0));
    cols.forEach((c) => { arr[c.k][idx[c.ym]] = Math.round(num(r[c.i])); });
    data.push([nama, pic, norm(r[7]), norm(r[9]), n1 && n2 && n1.toUpperCase() !== n2.toUpperCase() ? n2 : '', arr[0], arr[1], arr[2], norm(r[2])]);
  }
  if (data.length < 400) throw new Error('Tab Penjualan: baris terlalu sedikit (' + data.length + ') — dibatalkan');
  const isi = '/* otomatis dari tab "Database Penjualan": [nama, PIC, KAB sheet, Status, pasangan, PA HILO[], PA NS[], Sales Netto SO[], SO code] per bulan di m */\nconst WOW_SALES = ' + JSON.stringify({ m: bulan, r: data }) + ';\n';
  const lama = fs.existsSync(FILE_PJ) ? fs.readFileSync(FILE_PJ, 'utf8') : '';
  console.log('Penjualan: ' + bulan[0] + ' … ' + bulan[bulan.length - 1] + ' (' + bulan.length + ' bulan), ' + data.length + ' toko');
  if (isi === lama) { console.log('Penjualan: tidak ada perubahan.'); return; }
  if (DRY) { console.log('(--dry) penjualan berubah, tidak ditulis.'); return; }
  fs.writeFileSync(FILE_PJ, isi);
  console.log('Ditulis: wow_penjualan.js');
}

(async () => {

  // penjualan terpisah dari master: kalau gagal, master tetap diproses
  try { await tarikPenjualan(); } catch (e) { console.error('PERINGATAN penjualan: ' + e.message); }
  const rowsToko = await ambilCsv(GID_TOKO, 'Database', ['PIC', 'Nama Outlet Distr 1 (BCP, TBP, BCP ASO MDO)', 'Nama Outlet Distri2 (BSP, SHI, BSP JUPE MDO)', 'Kode Distri 1 (BCP, TBP, BCP ASO MDO)', 'Kode Distr 2 (BSP, SHI, BSP JUPE MDO)', 'KAB', 'Status Sewa']);
  const rowsKab = await ambilCsv(GID_KAB, 'Database Kabupaten', ['Nama Kabupaten/Kota', 'PIC']);
  console.log(`Sheet: ${rowsToko.length} baris Database, ${rowsKab.length} baris Database Kabupaten`);

  // ── PIC → kabupaten ──────────────────────────────────────────────────────
  const picKab = {};
  for (const r of rowsKab) {
    const pic = norm(r['PIC']);
    const kab = norm(r['Nama Kabupaten/Kota']);
    if (!pic || !kab) continue;
    (picKab[pic] = picKab[pic] || []).push(kab);
  }
  for (const pic of Object.keys(picKab)) {
    picKab[pic] = [...new Set(picKab[pic])].sort((a, b) => a.localeCompare(b));
  }
  // urutan PIC: pertahankan urutan lama biar diff-nya kecil, PIC baru ditaruh di belakang
  const lama = bacaLama();
  const picLama = Object.keys(lama.kab || {});
  const picUrut = [
    ...picLama.filter((p) => picKab[p]),
    ...Object.keys(picKab).filter((p) => !picLama.includes(p)).sort((a, b) => a.localeCompare(b)),
  ];
  const picKabRapi = {};
  for (const pic of picUrut) picKabRapi[pic] = picKab[pic];

  // ── daftar toko ──────────────────────────────────────────────────────────
  const pairLama = new Map(lama.toko.filter((t) => t.pair).map((t) => [t.name, t.pair]));
  const extraLama = new Map(); // kolom lain yang mungkin ditambahkan manual
  for (const t of lama.toko) {
    for (const k of Object.keys(t)) {
      if (!['name', 'pic', 'kab', 'pair'].includes(k)) extraLama.set(t.name, t);
    }
  }

  const urutan = [];
  const peta = new Map();
  const statusPer = new Map();
  for (const r of rowsToko) {
    // v2: nama boleh kosong — pakai nama Dist 2, lalu kode, sebagai cadangan
    const name = norm(r['Nama Outlet Distr 1 (BCP, TBP, BCP ASO MDO)'])
      || norm(r['Nama Outlet Distri2 (BSP, SHI, BSP JUPE MDO)'])
      || norm(r['Kode Distri 1 (BCP, TBP, BCP ASO MDO)'])
      || norm(r['Kode Distr 2 (BSP, SHI, BSP JUPE MDO)']);
    if (!name) continue;
    const pic = norm(r['PIC']);
    const kab = norm(r['KAB']);
    const status = norm(r['Status Sewa']);
    const so = norm(r['SO Group Code']), dd = norm(r['DISTRIBUTOR REWARD DISPLAY']);
    const sudah = peta.get(name);
    if (sudah) {
      // nama kembar: menangkan baris yang masih "Existing"
      const lamaExisting = statusPer.get(name) === 'Existing';
      if (lamaExisting || status !== 'Existing') continue;
      sudah.pic = pic || sudah.pic;
      sudah.kab = kab || sudah.kab;
      sudah.so = so || sudah.so; sudah.d = dd || sudah.d;
      statusPer.set(name, status);
      continue;
    }
    const e = { name, pic };
    if (kab) e.kab = kab;
    if (so) e.so = so;
    if (dd) e.d = dd;
    peta.set(name, e);
    statusPer.set(name, status);
    urutan.push(e);
  }

  // status sewa dari sheet (Existing / New / Cancel) -> dipakai kolom Status di dashboard
  for (const e of urutan) { const st = statusPer.get(e.name); if (st) e.st = st; }

  // Status yang diubah manual (belum diubah di Sheet): menang atas Sheet supaya tidak
  // kembali ke Existing tiap sinkron. Hapus barisnya kalau Sheet sudah diperbarui.
  const STATUS_MANUAL = {
    'TK NURJANNAH': 'Cancel',                              // PIC IMAD, Maros (26 Okt 2026)
    'TK. CAHAYA RAHMAT 16 / JL.LAIKANG NO 05 DEP': 'Cancel', // PIC IMAD, Makassar (26 Okt 2026)
  };
  for (const e of urutan) if (STATUS_MANUAL[e.name]) e.st = STATUS_MANUAL[e.name];

  // pertahankan kolom pair / kolom tambahan dari file lama
  for (const e of urutan) {
    const pair = pairLama.get(e.name);
    if (pair) e.pair = pair;
    const extra = extraLama.get(e.name);
    if (extra) for (const k of Object.keys(extra)) if (!(k in e)) e[k] = extra[k];
  }

  // Toko yang ada di file tapi tidak (lagi) ada di sheet TIDAK disimpan.
  // Daftar aplikasi = isi Sheet + toko popup (digabung saat aplikasi dibuka),
  // jadi tidak ada sisa/duplikat lama (permintaan 21 Okt 2026).
  for (const e of urutan) { delete e.k1; delete e.k2; } // kode distributor tidak dipakai lagi
  const adaDiSheet = new Set(urutan.map((e) => e.name));
  const dibuang = lama.toko.filter((t) => t.name && !adaDiSheet.has(t.name));
  if (dibuang.length) {
    const contoh = dibuang.slice(0, 5).map((t) => t.name).join(', ');
    console.log(`Toko tidak ada di sheet (dibuang): ${dibuang.length}${contoh ? ' — ' + contoh + (dibuang.length > 5 ? '…' : '') : ''}`);
  }

  // ── pengaman ─────────────────────────────────────────────────────────────
  if (urutan.length < 400) throw new Error(`Toko cuma ${urutan.length} (batas minimal 400) — dibatalkan`);
  if (picUrut.length < 8) throw new Error(`PIC cuma ${picUrut.length} (batas minimal 8) — dibatalkan`);
  for (const pic of picUrut) {
    if (!picKabRapi[pic].length) throw new Error(`PIC ${pic} tanpa kabupaten — dibatalkan`);
  }
  if (lama.toko.length && urutan.length < lama.toko.length * 0.9) {
    throw new Error(`Toko turun drastis (${lama.toko.length} → ${urutan.length}) — dibatalkan`);
  }

  // ── bandingkan ───────────────────────────────────────────────────────────
  // nomor SO terakhir di sheet (dipakai popup Input PIC/Toko di dashboard untuk SO Group Code berikutnya)
  const soMax = Math.max(0, ...rowsToko.map((r) => { const m = String(r['SO Group Code'] || '').match(/(\d+)\s*$/); return m ? +m[1] : 0; }));
  const isiBaru =
    'const WOW_TOKO_MASTER = ' + JSON.stringify(urutan) + ';\n' +
    'const WOW_SO_MAX = ' + soMax + ';\n' +
    'const WOW_PIC_KAB = ' + JSON.stringify(picKabRapi) + ';\n';
  const isiLama = fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8') : '';

  const namaLama = new Set(lama.toko.map((t) => t.name));
  const namaBaru = new Set(urutan.map((e) => e.name));
  const tambah = [...namaBaru].filter((n) => !namaLama.has(n));
  const buang = [...namaLama].filter((n) => !namaBaru.has(n));
  const picTokoLama = new Map(lama.toko.map((t) => [t.name, t.pic]));
  const gantiPic = urutan.filter((e) => picTokoLama.has(e.name) && picTokoLama.get(e.name) !== e.pic);
  const kabLama = new Map(lama.toko.map((t) => [t.name, t.kab || '']));
  const gantiKab = urutan.filter((e) => kabLama.has(e.name) && kabLama.get(e.name) !== (e.kab || ''));
  const kabMapBeda = JSON.stringify(lama.kab) !== JSON.stringify(picKabRapi);

  console.log(`Toko: ${lama.toko.length} → ${urutan.length} (tambah ${tambah.length}, hilang ${buang.length})`);
  console.log(`PIC: ${Object.keys(lama.kab).length} → ${picUrut.length}${kabMapBeda ? ' (peta kabupaten berubah)' : ''}`);
  console.log(`PIC toko berubah: ${gantiPic.length} · kabupaten toko berubah: ${gantiKab.length}`);
  if (tambah.length) console.log('  + ' + tambah.slice(0, 10).join('\n  + ') + (tambah.length > 10 ? `\n  + … ${tambah.length - 10} lagi` : ''));
  if (buang.length) console.log('  - ' + buang.slice(0, 10).join('\n  - ') + (buang.length > 10 ? `\n  - … ${buang.length - 10} lagi` : ''));
  if (gantiPic.length) console.log('  ~ ' + gantiPic.slice(0, 10).map((e) => `${e.name}: ${picTokoLama.get(e.name)} → ${e.pic}`).join('\n  ~ '));
  if (gantiKab.length) console.log('  ~ ' + gantiKab.slice(0, 10).map((e) => `${e.name}: ${kabLama.get(e.name) || '-'} → ${e.kab || '-'}`).join('\n  ~ '));

  const berubah = isiBaru !== isiLama;
  if (!berubah) {
    console.log('Tidak ada perubahan — file dibiarkan.');
    if (!DRY) fs.rmSync(JANJI, { force: true });
    return;
  }
  if (DRY) {
    console.log('(--dry) ada perubahan, tidak ditulis.');
    return;
  }
  fs.writeFileSync(FILE, isiBaru);
  fs.writeFileSync(JANJI, JSON.stringify({ tgl: new Date().toISOString(), toko: urutan.length, pic: picUrut.length }));
  console.log('Ditulis: wow_toko_master.js');
})().catch((e) => {
  console.error('GAGAL: ' + e.message);
  process.exit(1);
});
