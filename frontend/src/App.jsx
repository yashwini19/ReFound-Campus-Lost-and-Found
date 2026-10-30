
import { useEffect, useState } from "react";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("refoundUser")) || null;
    } catch {
      return null;
    }
  });

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("refoundTheme");

    return savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : "light";
  });

  // Apply and save theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("refoundTheme", theme);
  }, [theme]);

  // Toggle light and dark themes
  const toggleTheme = () => {
    setTheme((previous) =>
      previous === "dark" ? "light" : "dark"
    );
  };

  // Open login or registration
  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  // Handle successful login or registration
  const handleAuthenticated = (user) => {
    localStorage.setItem("refoundUser", JSON.stringify(user));
    setCurrentUser(user);
    setShowAuth(false);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("refoundToken");
    localStorage.removeItem("refoundUser");
    setCurrentUser(null);
    setShowAuth(false);
    setAuthMode("login");
  };

  // Show dashboard after authentication
  if (currentUser) {
    return (
      <Dashboard
        user={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="landing-page" id="home">

      {/* NAVIGATION */}
      <header className="navbar">
        <a href="#home" className="brand">
          <span className="brand-icon">R</span>
          ReFound
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <div className="nav-actions">
          <button
            className="theme-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            type="button"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            className="button button-outline"
            onClick={() => openAuth("login")}
            type="button"
          >
            Log in
          </button>

          <button
            className="button button-primary"
            onClick={() => openAuth("register")}
            type="button"
          >
            Get started
          </button>
        </div>
      </header>

      <main>

        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-star">✦</span>
              SMART CAMPUS LOST & FOUND
            </div>

            <h1>
              Lost something?
              <span>Let's find it.</span>
            </h1>

            <p className="hero-description">
              A smarter way to reconnect people with their lost belongings.
              Report, discover, verify, and return items through one trusted
              campus platform.
            </p>

            <div className="hero-actions">
              <button
                className="button button-primary hero-button"
                onClick={() => openAuth("register")}
                type="button"
              >
                Get started <span>→</span>
              </button>

              <button
                className="button button-secondary hero-button"
                onClick={() => openAuth("login")}
                type="button"
              >
                Find my item
              </button>
            </div>

            <div className="trust-line">
              <span>✦</span>
              Built for safer and smarter campus communities
            </div>
          </div>

          {/* FEATURE CARD */}
          <div className="hero-visual">
            <div className="floating-decoration decoration-one">✦</div>
            <div className="floating-decoration decoration-two">✧</div>

            <div className="found-card">
              <div className="card-top">
                <span className="card-label">RECENTLY FOUND</span>
                <span className="live-dot"></span>
              </div>

              <div className="item-icon">🎒</div>

              <h3>Black Backpack</h3>

              <p className="item-location">
                <span>📍</span> Found near the library
              </p>

              <div className="item-card-footer">
                <span>Today</span>
                <button
                  onClick={() => openAuth("login")}
                  type="button"
                >
                  View report <span>↗</span>
                </button>
              </div>
            </div>

            <div className="floating-note">
              <span className="note-icon">✓</span>
              <div>
                <strong>One campus. One community.</strong>
                <small>
                  Helping belongings find their way home.
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section" id="features">
          <div className="section-heading">
            <span className="section-eyebrow">WHY REFOUND?</span>
            <h2>Lost items. Found connections.</h2>
            <p>
              Everything your campus needs to make lost and found simple.
            </p>
          </div>

          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon">🔎</div>
              <h3>Easy discovery</h3>
              <p>
                Browse reported belongings and find items that match
                what you've lost.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Quick reporting</h3>
              <p>
                Report lost or found belongings with useful details
                and descriptions.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Safe reunions</h3>
              <p>
                Help students reconnect with their belongings through
                a trusted campus community.
              </p>
            </article>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <span className="section-eyebrow">SIMPLE PROCESS</span>
            <h2>Three steps to find it.</h2>
            <p>
              Getting belongings back should never be complicated.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">01</span>
              <h3>Report</h3>
              <p>
                Submit details about an item you've lost or found.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">02</span>
              <h3>Discover</h3>
              <p>
                Explore reports and look for matching belongings.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">03</span>
              <h3>Reconnect</h3>
              <p>
                Verify the item and help it return to its owner.
              </p>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="cta-section">
          <div>
            <span className="section-eyebrow">
              READY TO GET STARTED?
            </span>
            <h2>Let's bring lost things back home.</h2>
            <p>Join your campus community on ReFound.</p>
          </div>

          <button
            className="button button-primary cta-button"
            onClick={() => openAuth("register")}
            type="button"
          >
            Join ReFound <span>→</span>
          </button>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="footer">
        <a href="#home" className="brand">
          <span className="brand-icon">R</span>
          ReFound
        </a>

        <p>
          Making campus life a little less forgetful. © 2026 ReFound.
        </p>

        <a href="#home">Back to top ↑</a>
      </footer>

      {/* LOGIN / REGISTER MODAL */}
      {showAuth && (
        <div
          className="auth-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAuth(false);
            }
          }}
        >
          <div className="auth-modal">
            <button
              className="auth-close"
              onClick={() => setShowAuth(false)}
              aria-label="Close"
              type="button"
            >
              ×
            </button>

            <Auth
              onClose={() => setShowAuth(false)}
              initialMode={authMode}
              onAuthenticated={handleAuthenticated}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
