
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  // Load the previously selected theme.
  const [theme, setTheme] = useState(
    () => localStorage.getItem("refound-theme") || "light"
  );

  // Apply the theme and remember the user's choice.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("refound-theme", theme);
  }, [theme]);

  // Switch between light and dark mode.
  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  return (
    <div className="app">
      {/* Navigation */}
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">✦</span>
          <span>
            ReFound<span className="brand-dot">.</span>
          </span>
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
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
            title="Change theme"
          >
            {theme === "light" ? "☾" : "☀"}
          </button>

          <a className="login-link" href="#get-started">
            Log in
          </a>

          <a className="button button-small" href="#get-started">
            Get started <span>↗</span>
          </a>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="announcement">
              <span className="announcement-dot" />
              A smarter way to reunite with what matters
            </div>

            <h1>
              Lost something?
              <br />
              <span>Let's find it.</span>
            </h1>

            <p className="hero-description">
              A little less worrying. A little more finding.
              Discover lost belongings, connect with finders,
              and bring your important things back home.
            </p>

            <div className="hero-actions">
              <a className="button" href="#get-started">
                Find my item <span>→</span>
              </a>

              <a className="secondary-button" href="#features">
                Explore the platform <span>↗</span>
              </a>
            </div>

            <div className="trust-note">
              <span className="trust-icon">✓</span>
              Built for campus communities. Designed for trust.
            </div>
          </div>

          {/* Decorative sample item card */}
          <div className="hero-visual">
            <div className="visual-glow" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="floating-label label-top">
              <span className="label-icon">✦</span>
              Smart matching
            </div>

            <div className="item-card">
              <div className="item-card-top">
                <span className="item-status">
                  <span /> SAMPLE MATCH
                </span>
                <span className="item-menu">•••</span>
              </div>

              <div className="item-illustration">
                <div className="item-circle">🎒</div>
              </div>

              <div className="item-info">
                <span className="item-category">
                  PERSONAL BELONGINGS
                </span>
                <h3>Blue backpack</h3>
                <p>Library · Sample report</p>
              </div>

              <div className="match-box">
                <div>
                  <span className="match-label">
                    Potential match
                  </span>
                  <strong>Similarity preview</strong>
                </div>
                <span className="match-symbol">✧</span>
              </div>

              <div className="card-footer">
                <span>◉ Campus community</span>
                <span className="secure-label">
                  ♢ Private verification
                </span>
              </div>
            </div>

            <div className="floating-label label-bottom">
              <span className="verified-icon">✓</span>
              Ownership matters
            </div>

            <div className="sparkle sparkle-one">✦</div>
            <div className="sparkle sparkle-two">✧</div>
            <div className="sparkle sparkle-three">✦</div>
          </div>
        </section>

        {/* Features */}
        <section className="features-section" id="features">
          <div className="section-heading">
            <span className="eyebrow">MORE THAN LOST & FOUND</span>
            <h2>
              Finding things, made <span>smarter.</span>
            </h2>
            <p>
              Thoughtful technology. A safer way to reconnect.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon purple-icon">✧</div>
              <h3>Smart item matching</h3>
              <p>
                Discover similar reports using descriptions,
                categories, dates, and locations.
              </p>
              <span className="feature-number">01 / DISCOVER</span>
            </article>

            <article className="feature-card">
              <div className="feature-icon blue-icon">⌖</div>
              <h3>Campus-aware search</h3>
              <p>
                Search relevant reports and narrow down
                where your belongings may be.
              </p>
              <span className="feature-number">02 / LOCATE</span>
            </article>

            <article className="feature-card">
              <div className="feature-icon green-icon">♢</div>
              <h3>Trust comes first</h3>
              <p>
                Private ownership checks help make returns
                safer and more reliable.
              </p>
              <span className="feature-number">03 / VERIFY</span>
            </article>
          </div>
        </section>

        {/* How it works */}
        <section className="how-section" id="how-it-works">
          <div className="how-content">
            <span className="eyebrow">SIMPLE BY DESIGN</span>
            <h2>
              From lost to <span>found.</span>
            </h2>
            <p>
              Every step brings your belongings closer to home.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step">
              <span className="step-number">01</span>
              <h3>Report an item</h3>
              <p>Share what was lost or what you found.</p>
            </div>

            <div className="step">
              <span className="step-number">02</span>
              <h3>Discover a match</h3>
              <p>Review similar reports and their details.</p>
            </div>

            <div className="step">
              <span className="step-number">03</span>
              <h3>Verify and reunite</h3>
              <p>Confirm ownership before arranging a return.</p>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="cta-section" id="get-started">
          <div>
            <span className="eyebrow">YOUR CAMPUS, CONNECTED</span>
            <h2>Every lost thing deserves a chance.</h2>
            <p>Let's make finding it a little easier.</p>
          </div>

          <button
            className="button"
            onClick={() =>
              alert(
                "Welcome to ReFound! Registration will be added next."
              )
            }
          >
            Get started <span>→</span>
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <a className="brand" href="#home">
          <span className="brand-icon">✦</span>
          <span>
            ReFound<span className="brand-dot">.</span>
          </span>
        </a>

        <p>Thoughtfully built to bring things back together.</p>

        <span>© 2026 ReFound · Smart Lost & Found</span>
      </footer>
    </div>
  );
}

export default App;
