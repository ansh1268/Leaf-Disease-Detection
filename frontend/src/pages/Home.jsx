import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      
      {/* Hero Section */}
      <section className="hero-section">
        
        <div className="hero-content">
          
          <div className="hero-badge">
            🌿 AI Powered Plant Health
          </div>

          <h1>
            Smart Leaf Disease
            <span> Detection System</span>
          </h1>

          <p>
            Upload or capture a leaf image and let our AI analyze
            the plant for possible diseases in seconds.
          </p>

          <div className="hero-buttons">
            
            <button
              className="primary-btn"
              onClick={() => navigate("/detect")}
            >
              🔍 Start Detection
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/about")}
            >
              ℹ️ Learn More
            </button>

          </div>

        </div>

        <div className="hero-visual">
          <div className="leaf-circle">
            🌿
          </div>
        </div>

      </section>


      {/* Features Section */}
      <section className="features-section">

        <div className="section-heading">
          <span>POWERFUL FEATURES</span>

          <h2>
            Everything You Need For
            <br />
            Plant Health Detection
          </h2>

          <p>
            Use AI technology to quickly identify possible
            diseases from leaf images.
          </p>
        </div>


        <div className="features-grid">

          {/* Feature 1 */}
          <div className="feature-card">

            <div className="feature-icon">
              🤖
            </div>

            <h3>
              AI Disease Detection
            </h3>

            <p>
              Detect plant diseases using an AI model trained
              on different leaf disease classes.
            </p>

          </div>


          {/* Feature 2 */}
          <div className="feature-card">

            <div className="feature-icon">
              📷
            </div>

            <h3>
              Camera Support
            </h3>

            <p>
              Capture a live image directly using your camera
              and analyze it instantly.
            </p>

          </div>


          {/* Feature 3 */}
          <div className="feature-card">

            <div className="feature-icon">
              🔍
            </div>

            <h3>
              Image Quality Check
            </h3>

            <p>
              Check image quality, resolution, brightness and
              sharpness before prediction.
            </p>

          </div>


          {/* Feature 4 */}
          <div className="feature-card">

            <div className="feature-icon">
              🏆
            </div>

            <h3>
              Top Predictions
            </h3>

            <p>
              View the top predicted diseases along with their
              confidence scores.
            </p>

          </div>


          {/* Feature 5 */}
          <div className="feature-card">

            <div className="feature-icon">
              📄
            </div>

            <h3>
              PDF Report
            </h3>

            <p>
              Download a detailed disease detection report in
              PDF format.
            </p>

          </div>


          {/* Feature 6 */}
          <div className="feature-card">

            <div className="feature-icon">
              📜
            </div>

            <h3>
              Prediction History
            </h3>

            <p>
              View and manage your previous disease detection
              results.
            </p>

          </div>

        </div>

      </section>


      {/* How It Works */}
      <section className="how-it-works">

        <div className="section-heading">

          <span>HOW IT WORKS</span>

          <h2>
            Detect Disease in 3 Simple Steps
          </h2>

        </div>


        <div className="steps-container">

          <div className="step-card">

            <div className="step-number">
              1
            </div>

            <div>
              <h3>
                Upload Image
              </h3>

              <p>
                Upload a leaf image or capture a photo using
                your camera.
              </p>
            </div>

          </div>


          <div className="step-card">

            <div className="step-number">
              2
            </div>

            <div>
              <h3>
                AI Analysis
              </h3>

              <p>
                Our AI model analyzes the leaf image and checks
                for possible diseases.
              </p>
            </div>

          </div>


          <div className="step-card">

            <div className="step-number">
              3
            </div>

            <div>
              <h3>
                Get Results
              </h3>

              <p>
                View disease information, confidence, treatment
                and prevention advice.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* CTA Section */}
      <section className="cta-section">

        <h2>
          Ready to Check Your Plant?
        </h2>

        <p>
          Upload a clear leaf image and get an AI-powered
          prediction now.
        </p>

        <button
          className="primary-btn"
          onClick={() => navigate("/detect")}
        >
          🌿 Detect Leaf Disease
        </button>

      </section>

    </div>
  );
}

export default Home;