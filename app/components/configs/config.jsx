
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDtOJIDoUiEhBYV9ahk6VTsww6C-jgr4xQ",
  authDomain: "states-390ad.firebaseapp.com",
  databaseURL: "https://states-390ad-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "states-390ad",
  storageBucket: "states-390ad.firebasestorage.app",
  messagingSenderId: "992626600348",
  appId: "1:992626600348:web:c21c740310fac7f84dc059",
  measurementId: "G-S4NC3GBQBJ"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
export const auth = getAuth(app);
export default app;



const handleUpload = async (file) => {
  const storageRef = ref(storage, `videos/${file.name}`);
  await uploadBytes(storageRef, file);
  const videoUrl = await getDownloadURL(storageRef);

  // Сохранение метаданных видео в Firestore
  await addDoc(collection(db, "videos"), {
    url: videoUrl,
    duration: 30 // или другая логика для определения длительности
  });

  // Обновление состояния приложения
  setVideos((prevVideos) => [...prevVideos, videoUrl]);
};




// Function to sign up a new user
const signUp = (email, password) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      console.log("User signed up:", user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error signing up:", errorCode, errorMessage);
    });
};

// Function to sign in an existing user
const signIn = (email, password) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log("User signed in:", user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error signing in:", errorCode, errorMessage);
    });
};


  // Функция для входа через Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error logging in with Google:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <div>Welcome, {user.email}</div>;
  }