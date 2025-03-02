
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth  } from "firebase/auth";


// import { getDatabase, set } from "firebase/database";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;


// const addUser = (userId, name, email) => {
//   set(ref(db, 'users/' + userId), {
//     name: name,
//     email: email,
//     // Добавьте другие поля по мере необходимости
//   });
// };

// addUser("user1", "John Doe", "john.doe@example.com");




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

