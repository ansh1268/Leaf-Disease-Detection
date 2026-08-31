import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">

      {/* =========================
          PAGE HEADER
      ========================== */}

      <section className="about-header">

        <span className="page-badge">
          🌿 ABOUT THE PROJECT
        </span>

        <h1>
          About Leaf Disease Detection
        </h1>

        <p>
          An AI-powered system designed to identify plant leaf diseases
          from images and provide useful information about treatment
          and prevention.
        </p>

      </section>


      {/* =========================
          PROJECT OVERVIEW
      ========================== */}

      <section className="about-overview">

        <div className="about-icon">
          🌿
        </div>

        <div className="about-overview-content">

          <h2>
            Smart Plant Health Analysis
          </h2>

          <p>
            Leaf Disease Detection is an AI-powered web application that
            analyzes images of plant leaves and predicts possible diseases.
            Users can upload an existing image or capture a live image
            using their device camera.
          </p>

          <p>
            The system provides the predicted plant, disease name,
            confidence score, top predictions, treatment information,
            prevention suggestions and an image quality check before
            performing detection.
          </p>

        </div>

      </section>


      {/* =========================
          KEY FEATURES
      ========================== */}

      <section className="about-section">

        <div className="section-heading">

          <span>
            KEY FEATURES
          </span>

          <h2>
            What Can This System Do?
          </h2>

        </div>


        <div className="about-features-grid">


          <div className="about-feature-card">

            <div className="about-feature-icon">
              🤖
            </div>

            <h3>
              AI Disease Prediction
            </h3>

            <p>
              Analyze leaf images using a trained AI model to identify
              possible plant diseases.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-feature-icon">
              📷
            </div>

            <h3>
              Camera Capture
            </h3>

            <p>
              Capture a live photo of a leaf directly from your
              device camera.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-feature-icon">
              🔍
            </div>

            <h3>
              Image Quality Check
            </h3>

            <p>
              Analyze image resolution, brightness and sharpness
              before disease prediction.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-feature-icon">
              🏆
            </div>

            <h3>
              Top Predictions
            </h3>

            <p>
              View the top predicted disease classes with their
              confidence percentages.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-feature-icon">
              📄
            </div>

            <h3>
              PDF Report
            </h3>

            <p>
              Download the prediction result as a PDF report for
              future reference.
            </p>

          </div>


          <div className="about-feature-card">

            <div className="about-feature-icon">
              📜
            </div>

            <h3>
              Prediction History
            </h3>

            <p>
              Save and view previous disease detection results
              in prediction history.
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          HOW IT WORKS
      ========================== */}

      <section className="about-section how-system-works">

        <div className="section-heading">

          <span>
            HOW IT WORKS
          </span>

          <h2>
            Simple AI Detection Process
          </h2>

        </div>


        <div className="system-steps">


          <div className="system-step">

            <div className="system-step-number">
              1
            </div>

            <div>

              <h3>
                Select Leaf Image
              </h3>

              <p>
                Upload an image from your device or capture
                a new photo using the camera.
              </p>

            </div>

          </div>


          <div className="system-step">

            <div className="system-step-number">
              2
            </div>

            <div>

              <h3>
                Quality Analysis
              </h3>

              <p>
                The application checks the image quality,
                brightness, resolution and sharpness.
              </p>

            </div>

          </div>


          <div className="system-step">

            <div className="system-step-number">
              3
            </div>

            <div>

              <h3>
                AI Prediction
              </h3>

              <p>
                The trained model analyzes the leaf image
                and predicts the possible disease.
              </p>

            </div>

          </div>


          <div className="system-step">

            <div className="system-step-number">
              4
            </div>

            <div>

              <h3>
                Get Results
              </h3>

              <p>
                View confidence scores, treatment,
                prevention and top predictions.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          TECHNOLOGY STACK
      ========================== */}

      <section className="about-section">

        <div className="section-heading">

          <span>
            TECHNOLOGY
          </span>

          <h2>
            Technology Stack
          </h2>

        </div>


        <div className="tech-grid">

          <div className="tech-card">

            <div className="tech-icon">
              ⚛️
            </div>

            <h3>
              React
            </h3>

            <p>
              Frontend user interface
            </p>

          </div>


          <div className="tech-card">

            <div className="tech-icon">
              ⚡
            </div>

            <h3>
              FastAPI
            </h3>

            <p>
              Backend API and prediction service
            </p>

          </div>


          <div className="tech-card">

            <div className="tech-icon">
              🧠
            </div>

            <h3>
              Deep Learning
            </h3>

            <p>
              AI model for disease classification
            </p>

          </div>


          <div className="tech-card">

            <div className="tech-icon">
              📄
            </div>

            <h3>
              jsPDF
            </h3>

            <p>
              PDF report generation
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          PROJECT GOAL
      ========================== */}

      <section className="project-goal">

        <div className="project-goal-content">

          <div className="goal-icon">
            🌱
          </div>

          <h2>
            Our Goal
          </h2>

          <p>
            Our goal is to make plant disease detection easier and
            more accessible using artificial intelligence. This system
            can help users quickly identify possible leaf diseases and
            take better care of their plants.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/detect")}
          >
            🔍 Start Disease Detection
          </button>

        </div>

      </section>


      {/* =========================
          DISCLAIMER
      ========================== */}

      <section className="disclaimer">

        <h3>
          ⚠️ Important Disclaimer
        </h3>

        <p>
          The predictions generated by this system are based on the
          trained AI model and should be considered as an assistance
          tool. Results may not always be completely accurate.
          For serious plant health issues, consult an agricultural
          expert or plant specialist.
        </p>

      </section>

    </div>
  );
}

export default About;