/* Peta posisi PIC di Sulawesi — dipakai di dialog Export PDF Insight.
   Sumber bentuk: geoBoundaries IDN ADM2 (diselaraskan ke nama kabupaten WOW).
   Setiap kabupaten menyimpan daftar PIC pemiliknya (field "pics") sehingga
   peta bisa menyorot wilayah satu PIC saja, sementara sisa Sulawesi tampil
   sebagai latar abu-abu — dipakai untuk gambar "posisi PIC" di PDF. */
/* Seluruh isi dibungkus IIFE: aman bila skrip termuat dua kali (const tidak bentrok). */
(function(){
  if(typeof window!=='undefined'&&window.wowSulMapSVG)return;   // sudah terpasang
  /* Data bentuk kabupaten Sulawesi (wow_sulawesi_kab.js). Dibaca dari window,
     atau dari scope global bila skrip itu dimuat lebih dulu (deklarasi const
     di skrip biasa tidak menempel ke window). */
  const WOW_SUL_KAB=(typeof window!=='undefined'&&window.WOW_SUL_KAB)
    || (typeof globalThis!=='undefined'&&globalThis.WOW_SUL_KAB) || [];
  if(!WOW_SUL_KAB.length)console.warn('wow_sulawesi_map.js: data peta Sulawesi belum dimuat');
  const WOW_SUL_PROV_ORDER=['North Sulawesi','Gorontalo','Central Sulawesi','West Sulawesi','South Sulawesi','Southeast Sulawesi'];
  const WOW_SUL_PROV_LABEL={'North Sulawesi':'Sulut','Gorontalo':'Gorontalo','Central Sulawesi':'Sulteng','West Sulawesi':'Sulbar','South Sulawesi':'Sulsel','Southeast Sulawesi':'Sultra'};
  /* jangkar label provinsi (lon, lat) — diatur tangan agar tidak bertabrakan */
  const WOW_SUL_PROV_ANCHOR={'North Sulawesi':[126.15,5.05],'Gorontalo':[121.05,0.62],'Central Sulawesi':[121.55,-0.25],'West Sulawesi':[119.25,-1.65],'South Sulawesi':[119.55,-6.95],'Southeast Sulawesi':[123.05,-4.75]};
  const WOW_SUL_KAB_SHORT={'Kota Makassar':'Makassar','Kota Parepare':'Parepare','Kota Palopo':'Palopo','Kota Palu':'Palu','Kota Kendari':'Kendari','Kota Baubau':'Baubau','Kota Bitung':'Bitung','Kota Kotamobagu':'Kotamobagu','Kota Manado':'Manado','Kota Tomohon':'Tomohon','Kota Gorontalo':'K. Gorontalo','Pangkajene dan Kepulauan':'Pangkep','Kepulauan Selayar':'Selayar','Kepulauan Sangihe':'Sangihe','Kepulauan Talaud':'Talaud','Kepulauan Siau Tagulandang Biaro':'Sitaro','Bolaang Mongondow':'Bolmong','Bolaang Mongondow Utara':'Bolmut','Bolaang Mongondow Selatan':'Bolsel','Bolaang Mongondow Timur':'Boltim','Minahasa Tenggara':'Mitra','Minahasa Selatan':'Minsel','Minahasa Utara':'Minut','Sidenreng Rappang':'Sidrap','Polewali Mandar':'Polman','Toli-Toli':'Tolitoli','Tojo Una-Una':'Touna','Mamuju Tengah':'Mamteng','Banggai Kepulauan':'Bangkep','Banggai Laut':'Balut','Kolaka Timur':'Koltim','Kolaka Utara':'Kolut','Konawe Selatan':'Konsel','Konawe Utara':'Konut','Konawe Kepulauan':'Konkep','Buton Selatan':'Butsel','Buton Tengah':'Buteng','Buton Utara':'Butur','Muna Barat':'Mubar','Luwu Timur':'Lutim','Luwu Utara':'Lutra','Toraja Utara':'Torut','Gorontalo Utara':'Gorut','Bone Bolango':'Bonebol','Morowali Utara':'Morut','Pangkajene Dan Kepulauan':'Pangkep'};
  /* geser vertikal label kabupaten yang titik pusatnya berdesakan (derajat) */
  const WOW_SUL_KAB_LBL_OFF={'Kota Makassar':-0.22,'Maros':0.18,'Gowa':0.30,'Takalar':0.12,'Kota Parepare':-0.2,'Pinrang':0.15,'Barru':0.2,'Pangkajene dan Kepulauan':-0.1,'Kota Manado':-0.25,'Minahasa Utara':0.28,'Kota Bitung':0.2,'Kota Tomohon':-0.28,'Minahasa':0.1,'Minahasa Tenggara':-0.2,'Kota Gorontalo':-0.28,'Gorontalo':0.22,'Kota Palu':-0.1,'Donggala':-0.25,'Sigi':0.25,'Kota Kendari':-0.22,'Konawe':0.15,'Konawe Selatan':0.3,'Kolaka':0.15,'Kolaka Timur':0.28,'Kota Baubau':0.25,'Buton':-0.1,'Muna':0.15,'Kota Palopo':-0.28,'Luwu':0.25,'Luwu Utara':-0.1,'Tana Toraja':0.2,'Toraja Utara':-0.15,'Enrekang':-0.25,'Sidenreng Rappang':0.1,'Wajo':-0.1,'Bone':0.25,'Soppeng':0.05,'Sinjai':-0.05,'Bulukumba':0.15};
  /* perkiraan ukuran (derajat, sisi terpanjang) — dari bounding box tiap kabupaten */
  const WOW_SUL_KAB_SIZE={'Pangkajene dan Kepulauan':1.88,'Morowali':1.74,'Banggai':1.6,'Tojo Una-Una':1.51,'Kepulauan Selayar':1.65,'Parigi Moutong':1.45,'Buol':1.36,'Luwu Timur':1.32,'Konawe':1.31,'Gorontalo Utara':1.29,'Morowali Utara':1.23,'Banggai Laut':1.11,'Toli-Toli':1.04,'Konawe Utara':1.04,'Mamuju':1.04,'Luwu Utara':1.03,'Bolaang Mongondow Selatan':1.0,'Konawe Selatan':1.0,'Pohuwato':0.97,'Kolaka Timur':0.89,'Poso':0.86,'Gorontalo':0.83,'Bolaang Mongondow':0.81,'Banggai Kepulauan':0.77,'Bone':0.76,'Donggala':0.75,'Mamuju Tengah':0.74,'Sigi':0.71,'Buton Tengah':0.7,'Kolaka':0.69,'Gowa':0.67,'Sidenreng Rappang':0.67,'Tana Toraja':0.66,'Bombana':0.65,'Mamasa':0.63,'Bolaang Mongondow Utara':0.62,'Wakatobi':0.62,'Muna':0.61,'Pasangkayu':0.59,'Polewali Mandar':0.59,'Kolaka Utara':0.58,'Boalemo':0.56,'Luwu':0.55,'Wajo':0.55,'Buton':0.53,'Kepulauan Talaud':0.52,'Bulukumba':0.51,'Bone Bolango':0.51,'Maros':0.5,'Minahasa':0.5,'Minahasa Selatan':0.46,'Minahasa Utara':0.46,'Jeneponto':0.45,'Toraja Utara':0.42,'Takalar':0.41,'Enrekang':0.41,'Sinjai':0.4,'Soppeng':0.39,'Buton Utara':0.38,'Buton Selatan':0.37,'Bolaang Mongondow Timur':0.36,'Minahasa Tenggara':0.36,'Pinrang':0.36,'Muna Barat':0.34,'Majene':0.32,'Konawe Kepulauan':0.31,'Kepulauan Sangihe':0.28,'Palu':0.28,'Bitung':0.26,'Bantaeng':0.25,'Manado':0.25,'Barru':0.24,'Kendari':0.21,'Baubau':0.21,'Palopo':0.18,'Makassar':0.16,'Tomohon':0.15,'Kepulauan Siau Tagulandang Biaro':0.13,'Kotamobagu':0.12,'Kota Gorontalo':0.09,'Parepare':0.09};
  /* geseran penanda angka (derajat) untuk kabupaten yang pusatnya berdesakan —
     angka tetap terbaca, garis tipis menghubungkannya ke pusat wilayah */
  const WOW_SUL_KAB_BADGE_OFF={
 'Buton Selatan':[0.62,-0.42],
 'Buton Tengah':[-0.5,0.12],
 'Buton Utara':[0.55,0.42],
 'Muna Barat':[-0.52,-0.28],
 'Muna':[0.5,-0.15],
 'Wakatobi':[0.7,-0.35],
 'Kendari':[0.5,0.3],
 'Baubau':[0.5,-0.5],
 'Kolaka':[-0.5,0.45],
 'Kolaka Timur':[-0.6,0.5],
 'Kolaka Utara':[-0.55,0.35],
 'Konawe Kepulauan':[0.55,0.3],
 'Bombana':[0.45,0.5],
 'Banggai Kepulauan':[0.75,0.45],
 'Banggai Laut':[0.85,-0.5],
 'Buol':[-0.55,0.5],
 'Pohuwato':[-0.45,-0.55],
 'Gorontalo':[-0.15,0.72],
 'Gorontalo Utara':[0.6,0.35],
 'Boalemo':[-0.6,0.25],
 'Wajo':[0.62,0.35],
 'Soppeng':[-0.35,-0.55],
 'Sidenreng Rappang':[-0.62,-0.1],
 'Mamasa':[-0.5,0.45],
 'Polewali Mandar':[-0.62,-0.45],
 'Majene':[-0.5,0.3],
 'Enrekang':[-0.45,-0.5],
 'Pinrang':[0.55,0.2],
 'Konawe Utara':[-0.5,-0.55],
 'Tana Toraja':[0.6,-0.35],
 'Luwu':[-0.45,-0.5],
 'Luwu Utara':[0.5,-0.45],
 'Luwu Timur':[0.6,-0.4],
 'Morowali Utara':[-0.55,0.5],
 'Parigi Moutong':[-0.55,0.45],
 'Tojo Una-Una':[0.6,0.4],
 'Toli-Toli':[-0.5,-0.5],
 'Mamuju':[-0.5,-0.45],
 'Mamuju Tengah':[0.6,-0.3],
 'Pasangkayu':[0.5,0.3],
 'Donggala':[-0.55,-0.4],
 'Sigi':[0.55,-0.3],
 'Bone':[0.5,-0.45],
 'Bone Bolango':[0.55,0.4],
 'Bolaang Mongondow':[-0.2,-0.45],
 'Konawe Selatan':[0.5,-0.5],
 'Bantaeng':[-0.5,0.12],
 'Bulukumba':[0.55,0.3],
 'Gowa':[-0.3,-0.32],
 'Jeneponto':[-0.55,-0.15],
 'Makassar':[-0.68,0.18],
 'Maros':[-0.12,0.5],
 'Takalar':[-0.42,-0.42],
 'Minahasa Utara':[0.15,0.45],
 'Minahasa':[-0.5,0.1],
 'Minahasa Selatan':[-0.6,-0.35],
 'Minahasa Tenggara':[0.55,-0.4],
 'Manado':[0.45,0.35],
 'Bitung':[0.6,0.15],
 'Tomohon':[-0.55,-0.1],
 'Kotamobagu':[-0.35,-0.45],
 'Bolaang Mongondow Timur':[0.5,-0.2],
 'Bolaang Mongondow Utara':[-0.4,0.35],
 'Kepulauan Sangihe':[0.35,0.1],
 'Kepulauan Siau Tagulandang Biaro':[0.4,-0.25],
 'Kepulauan Talaud':[0.35,0]
};
  const WOW_SUL_PROV_RANGE={'North Sulawesi':'Bolaang Mongondow → Manado → Kep. Sangihe/Talaud','Gorontalo':'Boalemo → Kota Gorontalo → Pohuwato','Central Sulawesi':'Banggai → Poso → Toli-Toli → Palu','West Sulawesi':'Majene → Mamasa → Mamuju → Pasangkayu','South Sulawesi':'Selayar → Makassar → Bone → Toraja → Palopo','Southeast Sulawesi':'Buton → Kendari → Kolaka → Konawe'};
  /* Warna khas per PIC supaya legenda "punya siapa wilayah ini" gampang dibaca. */
  const WOW_SUL_PIC_COLOR={'HENDRY':'#2F6F4E','IAN':'#C98A1E','FATUR':'#B4483F','VILO':'#2E6FA3','IMAD':'#1F8A70','WAFI':'#7B4E9E','BINCHA':'#B8743A','LAYWITH':'#6E8F1F','PANCA':'#0E7C86','IMAD GTO':'#94623E'};

  function wowSulEsc(x){return String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  function wowSulColor(pic){return WOW_SUL_PIC_COLOR[pic]||'#235347';}
  function wowSulRings(k){return (k.r||[]).map(r=>r.map(p=>p[0].toFixed(2)+','+(-p[1]).toFixed(2)).join(' ')).join(' ');}
  /* kabupaten milik PIC: nama persis, plus varian "Nama *" untuk kabupaten yang dipakai 2 PIC */
  function wowSulOwned(pic){
    return (WOW_SUL_KAB||[]).filter(k=>(k.pics||[]).indexOf(pic)>=0&&!/\*$/.test(k.n));
  }
  function wowSulPicsInProv(prov){
    const set=[];
    (WOW_SUL_KAB||[]).forEach(k=>{if(k.p==prov)(k.pics||[]).forEach(p=>{if(set.indexOf(p)<0)set.push(p);});});
    return set;
  }

  /* ── tingkatan detail peta: "lengkap" (label kabupaten, garis penuh) atau
     "ringkas" (hanya sorotan PIC + label provinsi) untuk ruang PDF yang sempit ── */
  function wowSulMapSVG(pic,opts){
    opts=opts||{};
    const full=opts.detail!=='ringkas';
    const highlight=!!pic&&pic!=='Semua PIC';
    /* default: seluruh daratan Sulawesi (viewBox dalam derajat, bukan px) */
    const box=opts.box||'117.75 -1.55 7.60 9.20';
    const dimBase=opts.dimBase===true;
    /* ukuran font dalam satuan viewBox (derajat), bukan px */
    const LBL=(opts.lblSize||0.26), PROV=(opts.provSize||0.62);
    /* angka penanda untuk kabupaten kecil (tidak muat label) → dijelaskan di legenda */
    const MIN_LBL=opts.minLblSize||0.95;   // hanya kabupaten dengan sisi ≥ ini yang diberi label langsung
    const numbered=[];
    /* span = lebar viewBox (derajat); penanda & geseran ikut skala zoom supaya
       ukuran di kertas tetap sama walau peta diperbesar per wilayah PIC */
    const span=(()=>{const b=String(box).trim().split(/\s+/).map(Number);return b[2]||6;})();
    const ZOOM=span/6.0;
    /* radius penanda mengikuti lebar viewBox supaya ukuran di kertas tetap:
       ~2,5 mm pada peta selebar 111 mm */
    const NUMR=(opts.numR||0.023*span);
    let base='',over='',labels='';
    (WOW_SUL_KAB||[]).forEach(k=>{
      if(/^x/.test(k.n)||/\*$/.test(k.n))return;
      const isOwn=(k.pics||[]).indexOf(pic)>=0&&highlight;
      if(!isOwn){
        base+='<polygon points="'+wowSulRings(k)+'" class="wow-sul-base" fill-rule="evenodd"'+(dimBase?' opacity=".55"':'')+(full?' data-k="'+wowSulEsc(k.n)+'"':'')+'/>';
      }
    });
    if(!highlight){
      (WOW_SUL_KAB||[]).forEach(k=>{
        /* mode "Sulawesi keseluruhan": tiap kabupaten diwarnai PIC-nya */
        const own=(k.pics||[])[0]||'';
        over+='<polygon points="'+wowSulRings(k)+'" fill="'+wowSulColor(own)+'" fill-opacity="'+(full?0.9:0.86)+'" class="wow-sul-k" data-k="'+wowSulEsc(k.n)+'"><title>'+wowSulEsc(k.n+' · '+(k.pics||[]).join(' / '))+'</title></polygon>';
      });
    }else{
      /* Sulawesi tetap terlihat: semua kabupaten lain jadi latar, wilayah PIC dicetak penuh */
      (WOW_SUL_KAB||[]).forEach(k=>{
        if((k.pics||[]).indexOf(pic)<0)return;
        over+='<polygon points="'+wowSulRings(k)+'" class="wow-sul-k wow-sul-own" style="fill:'+wowSulColor(pic)+';fill-opacity:'+(full?0.82:0.8)+'" data-k="'+wowSulEsc(k.n)+'"><title>'+wowSulEsc(k.n+' · PIC '+pic)+'</title></polygon>';
      });
    }
    /* label kabupaten: hanya yang wilayahnya cukup luas; sisanya diberi angka */
    if(full){
      const sel=(WOW_SUL_KAB||[]).filter(k=>!highlight||(k.pics||[]).indexOf(pic)>=0)
        .slice().sort((a,b)=>(WOW_SUL_KAB_SIZE[b.n]||0)-(WOW_SUL_KAB_SIZE[a.n]||0));
      /* label yang terlalu berdekatan diganti angka agar tidak saling menimpa */
      const placed=[];
      sel.forEach(k=>{
        const sz=WOW_SUL_KAB_SIZE[k.n]||9;
        if(sz<MIN_LBL){numbered.push(k);return;}
        const short=WOW_SUL_KAB_SHORT[k.n]||(k.n.length>14?k.n.slice(0,13)+'…':k.n);
        const off=(WOW_SUL_KAB_LBL_OFF[k.n]||0)*ZOOM;
        const tx=k.c[0], ty=-k.c[1]+off;
        const halfW=Math.max(0.25,short.length*LBL*0.29);
        const clash=placed.some(p=>Math.abs(p.x-tx)<Math.max(halfW,p.w)&&Math.abs(p.y-ty)<LBL*1.5);
        if(clash){numbered.push(k);return;}
        placed.push({x:tx,y:ty,w:halfW});
        labels+='<text x="'+tx.toFixed(2)+'" y="'+ty.toFixed(2)+'" class="wow-sul-lbl">'+wowSulEsc(short)+'</text>';
      });
      numbered.sort((a,b)=>a.c[0]-b.c[0]||b.c[1]-a.c[1]);   /* urutan legenda = kiri→kanan, atas→bawah */
      numbered.forEach((k,ix)=>{
        const n=ix+1;
        const r=NUMR;
        const offRaw=WOW_SUL_KAB_BADGE_OFF[k.n]||[0,0];
        const off=[offRaw[0]*ZOOM,offRaw[1]*ZOOM];
        const bx=(k.c[0]+off[0]).toFixed(2), by=(-k.c[1]+off[1]).toFixed(2);
        if(off[0]||off[1]){
          labels+='<line x1="'+k.c[0].toFixed(2)+'" y1="'+(-k.c[1]).toFixed(2)+'" x2="'+bx+'" y2="'+by+'" stroke="#0B2B26" stroke-width=".03" stroke-opacity=".55"/>';
        }
        labels+='<g class="wow-sul-num"><circle cx="'+bx+'" cy="'+by+'" r="'+r+'"/>'
          +'<text x="'+bx+'" y="'+by+'" dy="'+(NUMR*0.33)+'">'+n+'</text>'
          +'<title>'+wowSulEsc(n+'. '+k.n)+'</title></g>';
      });
    }
    /* nama provinsi: hanya untuk peta ringkas; peta utama memakai legenda di samping */
    if(opts.provLabels){
      WOW_SUL_PROV_ORDER.forEach(p=>{
        const a=WOW_SUL_PROV_ANCHOR[p]||[120,-2];
        labels+='<text x="'+a[0]+'" y="'+(-a[1])+'" class="wow-sul-prov">'+wowSulEsc(WOW_SUL_PROV_LABEL[p]||p)+'</text>';
      });
    }
    return '<svg class="wow-sul-svg" viewBox="'+box+'" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">'
      +'<style>'
      +'.wow-sul-base{fill:#EEF1F0;stroke:#C3CEC8;stroke-width:0.05}'
      +'.wow-sul-k{stroke:#FFFFFF;stroke-width:0.06}'
      +'.wow-sul-own{stroke:#FFFFFF;stroke-width:0.09}'
      +'.wow-sul-lbl{font-size:'+LBL+';fill:#1B2B26;font-family:Poppins,Helvetica,Arial,sans-serif;text-anchor:middle;paint-order:stroke;stroke:#fff;stroke-width:'+(LBL*0.22)+'}'
      +'.wow-sul-num circle{fill:#0B2B26;stroke:#fff;stroke-width:.03}'
      +'.wow-sul-num text{font-size:'+(NUMR*0.92)+';fill:#fff;font-family:Poppins,Helvetica,Arial,sans-serif;font-weight:700;text-anchor:middle}'
      +'.wow-sul-prov{font-size:'+PROV+';fill:#0B2B26;font-family:Poppins,Helvetica,Arial,sans-serif;font-weight:700;letter-spacing:.04em;text-anchor:middle;paint-order:stroke;stroke:#fff;stroke-width:'+(PROV*0.22)+'}'
      +'</style>'
      +'<g>'+base+'</g><g>'+over+'</g><g>'+labels+'</g></svg>';
  }
  /* daftar kabupaten bernomor untuk legenda peta (urutan sama dengan angka di peta) */
  function wowSulNumbered(pic,minSz){
    const highlight=!!pic&&pic!=='Semua PIC';
    return (WOW_SUL_KAB||[]).filter(k=>!highlight||(k.pics||[]).indexOf(pic)>=0)
      .filter(k=>(WOW_SUL_KAB_SIZE[k.n]||9)<(minSz||0.95));
  }
  /* legenda PIC — dipakai di samping peta */
  function wowSulLegend(list){
    return '<div class="wow-sul-leg">'+list.map(x=>'<div class="wow-sul-leg-i"><span class="sw" style="background:'+wowSulColor(x.pic)+'"></span><span class="nm">'+wowSulEsc(x.pic)+'</span><span class="rg">'+wowSulEsc(x.range)+'</span></div>').join('')+'</div>';
  }

  /* ── kotak peta di dialog export: dua mode (posisi PIC vs Sulawesi) ── */
  let WOW_SUL_MODE='posisi';
  function wowSulMapBoxHTML(pic){
    const all=Object.keys(typeof WOW_PIC_KAB!=='undefined'?WOW_PIC_KAB:{}).sort();
    const tabs='<div class="wow-sul-tabs"><button type="button" class="'+(WOW_SUL_MODE==='posisi'?'on':'')+'" onclick="wowSulSetMode(\'posisi\')">Sorot PIC</button><button type="button" class="'+(WOW_SUL_MODE==='sulawesi'?'on':'')+'" onclick="wowSulSetMode(\'sulawesi\')">Seluruh Sulawesi</button></div>';
    const map=wowSulMapSVG(WOW_SUL_MODE==='posisi'?pic:'',{detail:'lengkap'});
    const leg=WOW_SUL_MODE==='posisi'?'':'';
    return '<div class="wow-sul-wrap">'+tabs+'<div class="wow-sul-map">'+map+'</div><div class="wow-sul-side">'+wowSulLegend(all.map(p=>({pic:p,range:wowPvRange(p)})))+'</div></div>';
  }
  function wowSulSetMode(m){
    WOW_SUL_MODE=m;
    const box=document.getElementById('wow-sul-box');
    const sel=document.getElementById('sel-export-pic');
    if(box)box.innerHTML=wowSulMapBoxHTML(sel?sel.value:'');
  }
  function wowPvRange(pic){
    const kabs=(typeof WOW_PIC_KAB!=='undefined'&&WOW_PIC_KAB[pic])||[];
    if(!kabs.length)return '—';
    const provs=WOW_SUL_PROV_ORDER.filter(pv=>kabs.some(k=>((WOW_SUL_KAB||[]).some(m=>m.n===k&&m.p===pv))));
    return provs.length?provs.map(pv=>WOW_SUL_PROV_LABEL[pv]||pv).join(' + '):kabs.length+' kabupaten';
  }

  /* ── raster: SVG → PNG (untuk jsPDF) tanpa pustaka tambahan ───────────── */
  function wowSulSvgToPng(svg,W,H,opts){
    opts=opts||{};
    return new Promise((resolve,reject)=>{
      try{
        const s=new XMLSerializer().serializeToString(svg);
        const url='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(s)));
        const img=new Image();
        img.onload=()=>{
          const c=document.createElement('canvas');c.width=W;c.height=H;
          const ctx=c.getContext('2d');
          ctx.fillStyle=opts.bg||'#FFFFFF';ctx.fillRect(0,0,W,H);
          ctx.drawImage(img,0,0,W,H);
          resolve(c.toDataURL('image/png'));
        };
        img.onerror=()=>reject(new Error('gambar peta gagal dimuat'));
        img.src=url;
      }catch(e){reject(e);}
    });
  }
  /* Bangun gambar untuk PDF:
     1) peta inti (batang tubuh Sulawesi, wilayah PIC disorot) — label kabupaten
     2) peta ringkas seluruh Sulawesi (posisi pulau, laut, dan kepulauan)
     3) peta kecil per provinsi untuk halaman detail */
  function wowSulMakeImages(pic){
    /* area yang dijadikan fokus: seluruh wilayah PIC + sisa Sulawesi sebagai latar,
       dijamin memuat seluruh daratan Sulawesi supaya "posisi" tetap terbaca */
    const SUL={x0:117.75,x1:125.35,y0:-7.65,y1:1.55};       // daratan utama Sulawesi
    const ISL={x0:118.4, x1:127.55,y0:-7.85,y1:5.95};       // + kepulauan Sangihe/Talaud
    const fit=(box,pad)=>({x0:box.x0-pad,x1:box.x1+pad,y0:box.y0-pad,y1:box.y1+pad});
    const owned=wowSulOwned(pic);
    let focus=null;
    if(owned.length){
      let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
      owned.forEach(k=>k.r.forEach(r=>r.forEach(q=>{x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);})));
      focus=fit({x0,x1,y0,y1},0.45);
      /* jaga bentuk mendekati 4:3 supaya muat di satu halaman PDF (tidak memanjang) */
      const TARGET=0.82, maxSpan=6.6;
      const fw=()=>focus.x1-focus.x0, fh=()=>focus.y1-focus.y0;
      const growW=(fw()<maxSpan)?Math.min(maxSpan,fh()/TARGET):fw();
      if(fw()<growW){const c=(focus.x0+focus.x1)/2;focus.x0=c-growW/2;focus.x1=c+growW/2;}
      const growH=Math.min(maxSpan,fw()*TARGET);
      if(fh()<growH){const c=(focus.y0+focus.y1)/2;focus.y0=c-growH/2;focus.y1=c+growH/2;}
      /* jangan sampai lebih sempit dari sepertiga Sulawesi, dan harus tetap di dalam Sulawesi */
      const minW=(SUL.x1-SUL.x0)*0.42,minH=(SUL.y1-SUL.y0)*0.42;
      if(focus.x1-focus.x0<minW){const c=(focus.x0+focus.x1)/2;focus.x0=c-minW/2;focus.x1=c+minW/2;}
      if(focus.y1-focus.y0<minH){const c=(focus.y0+focus.y1)/2;focus.y0=c-minH/2;focus.y1=c+minH/2;}
      /* batas luar = seluruh Sulawesi termasuk kepulauan, supaya wilayah kepulauan
         (Sangihe/Talaud/Sitaro/Selayar/Wakatobi) tidak terpotong */
      focus.x0=Math.max(focus.x0,ISL.x0);focus.x1=Math.min(focus.x1,ISL.x1);
      focus.y0=Math.max(focus.y0,ISL.y0);focus.y1=Math.min(focus.y1,ISL.y1);
    }else{
      focus=SUL;
    }
    const PXW=1240;
    const mkSVG=(b,o)=>{const d=document.createElement('div');
      d.innerHTML=wowSulMapSVG(pic,Object.assign({box:b.x0.toFixed(2)+' '+(-b.y1).toFixed(2)+' '+(b.x1-b.x0).toFixed(2)+' '+(b.y1-b.y0).toFixed(2)},o||{}));
      return d.querySelector('svg');};
    const H_=b=>Math.round(PXW*(b.y1-b.y0)/(b.x1-b.x0));
    const mainJob=wowSulSvgToPng(mkSVG(focus,{detail:'lengkap',lblSize:0.26,provLabels:false}),PXW,H_(focus),{bg:'#FFFFFF'});
    const overJob=wowSulSvgToPng(mkSVG(ISL,{detail:'ringkas',dimBase:true,provLabels:false}),PXW,H_(ISL),{bg:'#FFFFFF'});
    /* peta ketiga: seluruh Sulawesi diwarnai per PIC + wilayah PIC ini ditandai
       (untuk halaman "sebaran seluruh PIC"). */
    const allJob=wowSulSvgToPng(mkSVG(SUL,{detail:'ringkas',lblSize:0.24,provLabels:false}),PXW,H_(SUL),{bg:'#FFFFFF'});
    return Promise.all([mainJob,overJob,allJob]).then(([main,over,all])=>({
      main:main.data,mainW:PXW,mainH:H_(focus),focus:focus,
      over:over.data,overW:PXW,overH:H_(ISL),
      all:all.data,allW:PXW,allH:H_(SUL),
      prov:WOW_SUL_PROV_ORDER
    }));
  }

  window.wowSulMapSVG=wowSulMapSVG;
  window.wowSulMakeImages=wowSulMakeImages;
  window.wowSulMapBoxHTML=wowSulMapBoxHTML;
  window.wowSulSetMode=wowSulSetMode;
  window.wowSulNumbered=wowSulNumbered;
  window.wowSulColor=wowSulColor;
  window.wowSulOwned=wowSulOwned;
  window.WOW_SUL_KAB=WOW_SUL_KAB;
  window.WOW_SUL_PROV_ORDER=WOW_SUL_PROV_ORDER;
  window.WOW_SUL_PROV_LABEL=WOW_SUL_PROV_LABEL;
  window.WOW_SUL_PROV_RANGE=WOW_SUL_PROV_RANGE;
  window.wowSulLegend=wowSulLegend;
})();
