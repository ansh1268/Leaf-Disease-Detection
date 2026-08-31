import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Detect from "./pages/Detect";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import About from "./pages/About";

import "./App.css";


function App() {

  return (
    <BrowserRouter>

      {/* =========================
          NAVIGATION
      ========================== */}

      <Navbar />


      {/* =========================
          MAIN APPLICATION
      ========================== */}

      <main className="app-main">

        <Routes>

          {/* =========================
              HOME
          ========================== */}

          <Route
            path="/"
            element={<Home />}
          />


          {/* =========================
              DETECT DISEASE
          ========================== */}

          <Route
            path="/detect"
            element={<Detect />}
          />


          {/* =========================
              ANALYTICS
          ========================== */}

          <Route
            path="/analytics"
            element={<Analytics />}
          />


          {/* =========================
              PREDICTION HISTORY
          ========================== */}

          <Route
            path="/history"
            element={<History />}
          />


          {/* =========================
              ABOUT
          ========================== */}

          <Route
            path="/about"
            element={<About />}
          />


          {/* =========================
              404 / UNKNOWN PAGE
          ========================== */}

          <Route
            path="*"
            element={<Home />}
          />

        </Routes>

      </main>

    </BrowserRouter>
  );
}


export default App;