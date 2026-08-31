function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <h3>🌿 LeafDetect</h3>

          <p>
            AI-powered plant leaf disease
            detection system.
          </p>
        </div>


        {/* Quick Links */}
        <div className="footer-links">

          <h4>Quick Links</h4>

          <a href="/">🏠 Home</a>
          <a href="/detect">🔍 Detect</a>
          <a href="/analytics">📊 Analytics</a>
          <a href="/history">📜 History</a>
          <a href="/about">ℹ️ About</a>

        </div>


        {/* Features */}
        <div className="footer-features">

          <h4>Features</h4>

          <p>🌱 Disease Detection</p>
          <p>📷 Image Quality Check</p>
          <p>📊 Prediction Analytics</p>
          <p>📜 Detection History</p>
          <p>📄 PDF Reports</p>

        </div>


        {/* About */}
        <div className="footer-about">

          <h4>About Project</h4>

          <p>
            LeafDetect uses machine learning
            to help identify plant leaf diseases
            from uploaded images.
          </p>

        </div>

      </div>


      {/* Bottom */}
      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} LeafDetect.
          All rights reserved.
        </p>

        <span>
          Made with ❤️ using AI & React
        </span>

      </div>

    </footer>
  );
}

export default Footer;