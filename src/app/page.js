//npm run dev

"use client";

import { onValue, ref, update, getDatabase } from "firebase/database";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";

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
  const [HeatInstant, setHeatInstant] = useState(-1);

  //For cleaning
  const [cleaning, setCleaning] = useState(-1);
  const [forceCleaning, setForceCleaning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Default Status Message");

  //For Cooling
  const [Cooling, setCooling] = useState(-1);
  const [coolingStarted, setCoolingStarted] = useState(false);
  const [forceCooling, setForceCooling] = useState(false);

  const [data, setData] = useState("");
  const [voltage1, setVoltage1] = useState(-1);
  const [voltage2, setVoltage2] = useState(-1);
  const [LDR_Up_Right, setLDR1] = useState(-1);
  const [LDR_Up_Left, setLDR2] = useState(-1);
  const [LDR_Down_Right, setLDR3] = useState(-1);
  const [LDR_Down_Left, setLDR4] = useState(-1);

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

  const fetchCleaning = async () => {
    const dataRef = ref(database, "Cleaning/");
    onValue(dataRef, (snapshot) => {
      setCleaning(snapshot.val());
    });
  };

  const fetchData = async () => {
    const dataRef = ref(database, "Data/");
    onValue(dataRef, (snapshot) => {
      setData(snapshot.val());
    });
  };

  const fetchStatus = () => {
    fetchHeatInstant();
    fetchCooling();
    fetchCleaning();
    fetchData();
  }


  //Cleaning Unit Code
  let shouldClean = (forceCleaning = false, messageSetter) => {
    let isDirty = voltage1 - voltage2 > 6;
    let isLDRTriggered = LDR_Up_Right + LDR_Up_Left + LDR_Down_Right + LDR_Down_Left < 2000;
    let isSnowy = isLDRTriggered && isDirty;
    //Forced
    if (forceCleaning) {
      messageSetter("Caused because its forced.")
      return true
    }
    //Snowy
    if (isSnowy) {
      messageSetter("Caused because of snow.")
      return true
    }
    //Dirty
    if (isDirty) {
      messageSetter("Caused because of dirt.")
      return true
    }


    // If there is no problem 
    messageSetter("Panel is clean.")
    return false
  }

  useEffect(() => {
    const data_array = data.split(',');
    setVoltage1(+data_array[0]);
    setVoltage2(+data_array[1]);
    setLDR1(+data_array[2]);
    setLDR2(+data_array[3]);
    setLDR3(+data_array[4]);
    setLDR4(+data_array[5]);
  }, [data]);

  const ForceCooling = async () => {
    setForceCooling(!forceCooling);
  }

  const ForceCleaning = async () => {
    setForceCleaning(!forceCleaning);
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

  const StartCleaning = async () => {
    update(ref(database, '/'), {
      Cleaning: 1
    });
  }

  const StopCleaning = async () => {
    update(ref(database, '/'), {
      Cleaning: 0
    });
  }


  useEffect(() => {
    fetchStatus()

    if (forceCooling) {
      StartCooling();
      setCoolingStarted(true);
    } else if (HeatInstant >= 40 && !coolingStarted) {
      StartCooling();
      setCoolingStarted(true);
    } else if (HeatInstant <= 30)
      StopCooling();
    setCoolingStarted(false);

    if (shouldClean(forceCleaning, setStatusMessage)) {
      StartCleaning();
    } else {
      StopCleaning();
    }
  }, [HeatInstant, cleaning, coolingStarted, Cooling, statusMessage, forceCooling, forceCleaning, data, voltage1, voltage2, LDR_Up_Right, LDR_Up_Left, LDR_Down_Right, LDR_Down_Left])

  return (
    <div>
      <h1>LDR Top LEFT: {LDR_Up_Left} --- Top RIGHT: {LDR_Up_Right}</h1>
      <h1>LDR Bottom LEFT: {LDR_Down_Left} --- Bottom RIGHT: {LDR_Down_Right}</h1>
      <h1>Smart Solar System Voltage: {voltage1}</h1>
      <h1>Normal Panel Voltage: {voltage2}</h1>

      <h1>Cooling Unit ON/OFF: {Cooling}</h1>
      <h1>Cleaning Unit ON/OFF: {cleaning}</h1>
      <h1>{statusMessage}</h1> {/*Panel surface condition*/}
      <h1>Temperarute: {HeatInstant}°C</h1>
      <button className="coolingButton" onClick={() => ForceCooling()}>Cooling</button>
      <button className="cleaningButton" onClick={() => ForceCleaning()}>Force Clean</button>
    </div>
  );
}
