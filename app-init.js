const FIREBASE_CONFIG={apiKey:"AIzaSyDO3IzpBcP9VT5cL7QT4RlK_a9jpGS0Yvo",authDomain:"displaywowsulawesi.firebaseapp.com",projectId:"displaywowsulawesi",storageBucket:"displaywowsulawesi.firebasestorage.app",messagingSenderId:"430961661167",appId:"1:430961661167:web:fa6ae3497bb336a4bc771a"};
function initFirebaseApp(){
  try{
    firebase.initializeApp(FIREBASE_CONFIG);
    window.db=firebase.firestore();
    window.db.enablePersistence({synchronizeTabs:true}).catch(e=>console.warn('persistence unavailable',e.code||e));
    window.storage=firebase.storage();
  }catch(e){console.warn('Firebase init failed',e);}
}
initFirebaseApp();
loadCustomStores();
loadSpgCustomStores();
loadSpgNames();

async function compressAndUpload(dataUrl){
  const img=new Image();
  await new Promise(r=>{img.onload=r;img.src=dataUrl;});
  const MAX=800;let w=img.width,h=img.height;
  if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
  const c=document.createElement('canvas');c.width=w;c.height=h;
  c.getContext('2d').drawImage(img,0,0,w,h);
  const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',0.6));
  return await new Promise(r=>{const rd=new FileReader();rd.onload=()=>r(rd.result);rd.readAsDataURL(blob);});
}
