import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,onAuthStateChanged,signInWithPopup,signOut} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js';
import {doc,getDocFromServer,getFirestore,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js';

// Configuração pública do aplicativo web. As regras do Firestore controlam o acesso aos saves.
const app=initializeApp({
  apiKey:'AIzaSyBUEIsEC7GF5m3jNXy-BGCIfpmBrsWH8bM',
  authDomain:'catoonstd.firebaseapp.com',
  projectId:'catoonstd',
  messagingSenderId:'615159483667',
  appId:'1:615159483667:web:d9bafb2be3bf4a22085ee6'
});
const auth=getAuth(app), db=getFirestore(app);
const provider=new GoogleAuthProvider();
provider.setCustomParameters({prompt:'select_account'});

function saveRef(uid){
  return doc(db,'saves',uid);
}

function readSave(snapshot){
  if(!snapshot.exists())return null;
  const {schema,version,data}=snapshot.data();
  if(schema!==1||typeof version!=='string'||typeof data!=='string')throw Error('Invalid cloud save');
  return {version,data};
}

export const service={
  observe:callback=>onAuthStateChanged(auth,callback),
  signIn:()=>signInWithPopup(auth,provider),
  signOut:()=>signOut(auth),
  read:async uid=>readSave(await getDocFromServer(saveRef(uid))),
  write(uid,expected,data){
    const ref=saveRef(uid),version=crypto.randomUUID();
    return runTransaction(db,async tx=>{
      const current=readSave(await tx.get(ref));
      if((current?.version??null)!==expected)return null;
      tx.set(ref,{schema:1,version,data,updatedAt:serverTimestamp()});
      return {version,data};
    });
  }
};
