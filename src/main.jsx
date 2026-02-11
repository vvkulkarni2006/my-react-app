import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

function WelcomeScreen({ onFinish }) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="welcomePage">
      <div className="welcomeContent">
        <h1>Welcome to Our Hospital</h1>
        <h2>{greeting}</h2>
        <p>Caring for you with compassion and excellence</p>
      </div>
    </div>
  );
}

function Root() {
  const [showWelcome, setShowWelcome] = useState(true);

  return showWelcome ? (
    <WelcomeScreen onFinish={() => setShowWelcome(false)} />
  ) : (
    <div className="pageBg">
      <div className="pageContainer">
        <div className="card">
          <App />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
