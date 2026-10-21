const fs = require('fs');
function loadVar(file, varName) {
  const src = fs.readFileSync(file, 'utf8');
  const start = src.indexOf(varName + ' = ') + (varName + ' = ').length;
  const rest = src.slice(start);
  // find matching bracket
  let depth = 0, end = -1;
  for (let i = 0; i < rest.length; i++) {
    const c = rest[i];
    if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') { depth--; if (depth === 0 && c === ']') { end = i; break; } }
  }
  return { data: JSON.parse(rest.slice(0, end + 1)), start, end: start + end + 1, src };
}
const tm = loadVar('wow_toko_master.js', 'WOW_TOKO_MASTER');
console.log('TOKO MASTER', tm.data.length);
const pen = loadVar('wow_penjualan.js', 'WOW_SALES');
console.log('pen keys', Object.keys(pen.data), 'rows', pen.data.r.length);
console.log(JSON.stringify(pen.data.r[0]));
console.log(JSON.stringify(pen.data.r[pen.data.r.length - 1]));
// find by name substrings
const find = (s) => {
  const q = s.toUpperCase();
  console.log('---', s);
  tm.data.forEach((o, i) => { if (JSON.stringify(o).toUpperCase().includes(q)) console.log('  TM', i, JSON.stringify(o)); });
  pen.data.r.forEach((r, i) => { if (JSON.stringify(r).toUpperCase().includes(q)) console.log('  SALES', i, JSON.stringify(r).slice(0, 200)); });
};
['FERDI JAYA', 'NYOMAN/KAWANGKOAN', 'FANNY KIOS', 'MANDIRI TK', 'MARPAM', 'TIGA JAYA', 'TIGA JAYA', 'FERDY', 'BAJOE'].forEach(find);
