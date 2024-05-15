//npm run dev

"use client";

import { DataSnapshot, get, onValue, query, ref, set, update, getDatabase } from "firebase/database";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics"; //For not realtime database!!!
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
//const firebaseConfig = {
  //apiKey: "AIzaSyAaOsqbBB4utAszWNNs3_SfJP2hWemqgLI",
  //authDomain: "smart-solar-system-8f32e.firebaseapp.com",
  //databaseURL: "https://smart-solar-system-8f32e-default-rtdb.firebaseio.com",
  //projectId: "smart-solar-system-8f32e",
  //storageBucket: "smart-solar-system-8f32e.appspot.com",
  //messagingSenderId: "219207964754",
  //appId: "1:219207964754:web:c745ff4ce97d0e9e6b678b",
  //measurementId: "G-7CCM3XYYJ2",
//};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
//const analytics = getAnalytics(app); //For not realtime database!!!

export default function Home() {
  const [LED, setLED] = useState(-1);
  const [LDRs, setLDRs] = useState(-1);
  const [HeatInstant, setHeatInstant] = useState(-1);
  const [Cooling, setCooling] = useState(-1);
  const [coolingStarted, setCoolingStarted] = useState(false);

  const fetchLED = async () => {
    const dataRef = ref(database, "LED/");
    onValue(dataRef, (snapshot) => {
      setLED(snapshot.val());
    });
  };

  const fetchLDRs = async () => {
    const dataRef = ref(database, "LDRs/");
    onValue(dataRef, (snapshot) => {
      setLDRs(snapshot.val());
    });
  };

  const fetchHeatInstant = async () => {
    const dataRef = ref(database, "HeatInstant/");
    onValue(dataRef, (snapshot) => {
      setHeatInstant(snapshot.val());
    });
  };

  const fetchCooling = async () => {
    const dataRef = ref(database, "Cooling/");
    onValue(dataRef, (snapshot) => {
      setCooling(snapshot.val());
    });
  };

  useEffect(() => {
    fetchLED();
    fetchLDRs();
    fetchHeatInstant();
    fetchCooling();
  }, []);

  //Cooling Unit Code
  useEffect(() => {
    if (HeatInstant >= 25 && !coolingStarted) {
      StartCooling();
      setCoolingStarted(true);
    }else if (HeatInstant <= 23)
      StopCooling();
      setCoolingStarted(false);
  }, [HeatInstant, coolingStarted]);

  const ButonOn = async () => {
    update(ref(database, '/'), {
      LED: 1
    });
  }

  const ButonOff = async () => {
    update(ref(database, '/'), {
      LED: 0
    });
  }

  const StartCooling = async () => {
    update(ref(database, '/'), {
      Cooling: 1
    });
  }

  const StopCooling = async () => {
    update(ref(database, '/'), {
      Cooling: 0
    });
  }

  return (
    <div>
      <h1>LDR_Down_Left: {LDRs.LDR_Down_Left}</h1>
      <h1>LDR_Down_Right: {LDRs.LDR_Down_Right}</h1>
      <h1>LDR_Up_Left: {LDRs.LDR_Up_Left}</h1>
      <h1>LDR_Up_Right: {LDRs.LDR_Up_Right}</h1>
      <h1>Arduino LED ON/OFF: {LED}</h1>
      <h1>Cooling Unit ON/OFF: {Cooling}</h1>
      <h1>Heat: {HeatInstant}°C</h1>
      <button className="customButton" onClick={() => ButonOn()}>ON</button>
      <button className="customButton" onClick={() => ButonOff()}>OFF</button>
    </div>
  );
}
