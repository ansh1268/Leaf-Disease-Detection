import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="nav-container">

        {/* LOGO */}

        <NavLink
          to="/"
          className="nav-logo"
        >
          🌿 LeafDetect
        </NavLink>


        {/* NAVIGATION LINKS */}

        <div className="nav-links">

          {/* HOME */}

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            🏠 Home
          </NavLink>


          {/* DETECT */}

          <NavLink
            to="/detect"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            🔍 Detect
          </NavLink>


          {/* ANALYTICS - NEW */}

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            📊 Analytics
          </NavLink>


          {/* HISTORY */}

          <NavLink
            to="/history"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            📜 History
          </NavLink>


          {/* ABOUT */}

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            ℹ️ About
          </NavLink>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;