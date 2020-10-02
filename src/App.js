import React, {useRef, useState} from 'react';
import firebase from "firebase";
import 'firebase/auth';
import './App.css';

import {useAuthState} from "react-firebase-hooks/auth";
import {useCollectionData} from "react-firebase-hooks/firestore";

firebase.initializeApp({
    //Your Firebase Config here! :)
})
const auth = firebase.auth();
const firestore = firebase.firestore();
function App() {
    const [user] = useAuthState(auth);
    return (
    <div className="App">
      <header>
            <h1>ReactChatApp⚛️🔥💬</h1>
          <SignOut />
      </header>
        <section>
            {user ? <ChatRoom /> : <SignIn />}
        </section>
    </div>
  );
}

function SignIn(){
    const signInWithGoogle = ()=>{
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    }

    return <button onClick={signInWithGoogle}>Sign in with Google</button>
}

function  SignOut() {
    return auth.currentUser && (
        <button onClick={ ()=>{auth.signOut()} }>SignOut</button>
    )
}
function  ChatRoom() {
    const dummy = useRef();
    const messageRef = firestore.collection('messages');
    const query = messageRef.orderBy('createdAt').limit(25);
    const [messages] = useCollectionData(query, {idField:'id'});
    const [formValue, setFormValue] = useState('');
    const sendMessage = async(e)=>{
        e.preventDefault();
        const {uid, photoURL} = auth.currentUser;
        console.log(formValue);
        await messageRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        });
        setFormValue('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    }
    return (
        <div>
            <h1>Welcome to chat App</h1>
            <main>
                {messages && messages.map(
                    msg=> <ChatMessage key={msg.id} message={msg} />)
                }
                <div ref={dummy}></div>
            </main>
            <form>
                <input type="text" value={formValue} onChange={(e)=>setFormValue(e.target.value)} />
                <button type="submit" onClick={sendMessage}>Send Message</button>
            </form>
        </div>)
}

function ChatMessage(props){
    const {text, uid, photoURL} = props.message;
    console.log(photoURL);
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL} alt="UserProfilePic" />
            <p>{text}</p>
        </div>
    )
}
export default App;
