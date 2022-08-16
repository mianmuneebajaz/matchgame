import MemoryGame from './MemoryGame/';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";


// Todo: Update These
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-J1qv-tvntsNZeRZd7trdW3bnU_9PM2E",
  authDomain: "clout-9a822.firebaseapp.com",
  projectId: "clout-9a822",
  storageBucket: "clout-9a822.appspot.com",
  messagingSenderId: "887879309926",
  appId: "1:887879309926:web:a0a94ccf2eac91bfbfaba7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const database = getDatabase(app)

const App = () => {
  return <MemoryGame database={database} app={app}></MemoryGame>
}

export default App;
