import React, { useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/analytics";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
	apiKey: "AIzaSyD0uoPwQmQU6rDyp4kwJ1mnLclbT0R75JA",
	authDomain: "chatting-423aa.firebaseapp.com",
	databaseURL: "https://chatting-423aa-default-rtdb.firebaseio.com",
	projectId: "chatting-423aa",
	storageBucket: "chatting-423aa.appspot.com",
	messagingSenderId: "713374034782",
	appId: "1:713374034782:web:5d220e0b876a5d87eb7dcf",
	measurementId: "G-4D3L92D18Z",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
	const [user] = useAuthState(auth as any);

	return (
    <div className="App">
      <header>
        <h1>💬 Friend Chat</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		auth.signInWithPopup(provider);
	};

	return (
		<>
			<button className="sign-in" onClick={signInWithGoogle}>
				Sign in with Google
			</button>
			<p>
				Do not violate the community guidelines or you will be banned for life!
			</p>
		</>
	);
}

function SignOut() {
	return (
		auth.currentUser && (
			<button className="sign-out" onClick={() => auth.signOut()}>
				Sign Out
			</button>
		)
	);
}

function ChatRoom() {
	const dummy = useRef<null | HTMLDivElement>();
	const messagesRef = firestore.collection("messages");
	const query = messagesRef.orderBy("createdAt").limit(25);

	const [messages] = useCollectionData(query as any, { idField: "id" } as any);

	const [formValue, setFormValue] = useState("");

	const sendMessage = async (e: any) => {
		e.preventDefault();

		const { uid, photoURL } = auth.currentUser as any;

		await messagesRef.add({
			text: formValue,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			uid,
			photoURL,
		});

		setFormValue("");
		if(dummy.current) dummy.current.scrollIntoView({ behavior: "smooth" } as any);
	};

	return (
		<>
			<main>
				{messages &&
					messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

				<span ref={dummy as any}></span>
			</main>

			<form onSubmit={sendMessage}>
				<input
					value={formValue}
					onChange={(e) => setFormValue(e.target.value)}
					placeholder="say something nice"
				/>

				<button type="submit" disabled={!formValue}>
					🗨️
				</button>
			</form>
		</>
	);
}

function ChatMessage(props: any) {
	const { text, uid, photoURL } = props.message;
	if (auth.currentUser === null) return <></>;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

	return (
		<>
			<div className={`message ${messageClass}`}>
				<img
					src={
						photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
					}
				/>
				<p>{text}</p>
			</div>
		</>
	);
}

export default App;
