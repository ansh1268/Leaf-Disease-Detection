import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import "../App.css";
function App() {
  // ================================
  // STATES
  // ================================

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [result, setResult] = useState(null);
  const [qualityWarning, setQualityWarning] = useState("");

  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [history, setHistory] = useState([]);

  // Camera states
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ================================
  // LOAD HISTORY
  // ================================

  useEffect(() => {
    const savedHistory = localStorage.getItem("predictionHistory");

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("History load error:", error);
      }
    }
  }, []);

  // ================================
  // SAVE HISTORY
  // ================================

  useEffect(() => {
    localStorage.setItem(
      "predictionHistory",
      JSON.stringify(history)
    );
  }, [history]);

  // ================================
  // DARK MODE
  // ================================

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // ================================
  // IMAGE SELECT
  // ================================

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Stop camera if running
    stopCamera();

    // Reset old result
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));

    setResult(null);
    setQualityWarning("");
  };

  // ================================
  // OPEN CAMERA
  // ================================

  const openCamera = async () => {
    try {
      setCameraError("");
      setResult(null);
      setQualityWarning("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError(
          "Camera is not supported in this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment"
          },
          audio: false
        });

      streamRef.current = stream;

      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);

    } catch (error) {
      console.error("Camera error:", error);

      setCameraError(
        "Unable to access camera. Please allow camera permission."
      );
    }
  };

  // ================================
  // STOP CAMERA
  // ================================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

  // ================================
  // CAPTURE PHOTO
  // ================================

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }

        const file = new File(
          [blob],
          `leaf-camera-${Date.now()}.jpg`,
          {
            type: "image/jpeg"
          }
        );

        setSelectedImage(file);

        setImagePreview(
          URL.createObjectURL(blob)
        );

        setResult(null);
        setQualityWarning("");

        stopCamera();
      },
      "image/jpeg",
      0.95
    );
  };

  // ================================
  // DETECT DISEASE
  // ================================

  const detectDisease = async () => {
    if (!selectedImage) {
      alert(
        "Please choose an image or capture a photo first."
      );
      return;
    }

    try {
      setLoading(true);

      setResult(null);
      setQualityWarning("");

      const formData = new FormData();

      formData.append(
        "file",
        selectedImage
      );

      const response = await fetch(
  "https://leaf-disease-backend-2026.onrender.com/predict",
  {
    method: "POST",
    body: formData,
  }
);

      const data = await response.json();

      // ================================
      // IMAGE QUALITY WARNING
      // ================================

      if (data.valid_image === false) {
        setQualityWarning(
          data.message ||
          "Image quality is not suitable for prediction."
        );

        setResult(null);
        return;
      }

      // ================================
      // NORMAL RESULT
      // ================================

      setResult(data);

      // Add prediction to history
      const historyItem = {
        id: Date.now(),

        plant:
          data.plant || "Unknown",

        disease:
          data.disease || "Unknown",

        confidence:
          Number(data.confidence || 0),

        isUnknown:
          data.is_unknown ||
          data.unknown ||
          false,

        time: new Date().toLocaleString()
      };

      setHistory((previousHistory) => [
        historyItem,
        ...previousHistory
      ]);

    } catch (error) {
      console.error(
        "Prediction error:",
        error
      );

      setQualityWarning(
        "Unable to connect to the backend. Please make sure the FastAPI server is running."
      );

    } finally {
      setLoading(false);
    }
  };

  // ================================
  // CLEAR HISTORY
  // ================================

  const clearHistory = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear prediction history?"
    );

    if (confirmClear) {
      setHistory([]);

      localStorage.removeItem(
        "predictionHistory"
      );
    }
  };

  // ================================
  // DOWNLOAD PDF REPORT
  // ================================

  const downloadPDF = () => {
    if (!result) {
      alert(
        "Please detect a disease before downloading the report."
      );
      return;
    }

    const pdf = new jsPDF();

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    // ================================
    // TITLE
    // ================================

    pdf.setFontSize(22);

    pdf.text(
      "Leaf Disease Detection Report",
      pageWidth / 2,
      20,
      {
        align: "center"
      }
    );

    // ================================
    // IMAGE
    // ================================

    let currentY = 32;

    if (imagePreview) {
      try {
        pdf.addImage(
          imagePreview,
          "JPEG",
          60,
          currentY,
          90,
          65
        );

        currentY += 80;

      } catch (error) {
        console.error(
          "PDF image error:",
          error
        );
      }
    }

    // ================================
    // RESULT
    // ================================

    pdf.setFontSize(15);

    pdf.text(
      `Plant: ${result.plant || "Unknown"}`,
      20,
      currentY
    );

    currentY += 12;

    pdf.text(
      `Disease: ${result.disease || "Unknown"}`,
      20,
      currentY
    );

    currentY += 12;

    pdf.text(
      `Confidence: ${Number(
        result.confidence || 0
      ).toFixed(2)}%`,
      20,
      currentY
    );

    currentY += 18;

    // ================================
    // UNKNOWN LEAF
    // ================================

    if (
      result.is_unknown ||
      result.unknown
    ) {
      pdf.text(
        "Status: Unknown Leaf",
        20,
        currentY
      );

      currentY += 15;
    }

    // ================================
    // TREATMENT
    // ================================

    pdf.setFontSize(16);

    pdf.text(
      "About / Treatment",
      20,
      currentY
    );

    currentY += 10;

    pdf.setFontSize(12);

    const treatmentLines =
      pdf.splitTextToSize(
        result.treatment ||
        "No treatment information available.",
        170
      );

    pdf.text(
      treatmentLines,
      20,
      currentY
    );

    currentY +=
      treatmentLines.length * 7 + 12;

    // ================================
    // PREVENTION
    // ================================

    pdf.setFontSize(16);

    pdf.text(
      "Prevention",
      20,
      currentY
    );

    currentY += 10;

    pdf.setFontSize(12);

    const preventionLines =
      pdf.splitTextToSize(
        result.prevention ||
        "No prevention information available.",
        170
      );

    pdf.text(
      preventionLines,
      20,
      currentY
    );

    // ================================
    // TOP 3 PREDICTIONS
    // ================================

    if (
      result.top_predictions &&
      result.top_predictions.length > 0
    ) {
      currentY +=
        preventionLines.length * 7 + 20;

      // New page if needed
      if (currentY > 250) {
        pdf.addPage();

        currentY = 25;
      }

      pdf.setFontSize(16);

      pdf.text(
        "Top Predictions",
        20,
        currentY
      );

      currentY += 12;

      pdf.setFontSize(12);

      result.top_predictions.forEach(
        (prediction, index) => {
          const rank =
            index === 0
              ? "1."
              : index === 1
              ? "2."
              : "3.";

          const text =
            `${rank} ${prediction.plant} - ` +
            `${prediction.disease} - ` +
            `${Number(
              prediction.confidence
            ).toFixed(2)}%`;

          pdf.text(
            text,
            20,
            currentY
          );

          currentY += 10;
        }
      );
    }

    // ================================
    // SAVE PDF
    // ================================

    pdf.save(
      `Leaf_Disease_Report_${Date.now()}.pdf`
    );
  };
    // ================================
  // MAIN UI
  // ================================

  return (
    <div className="app">
      <div className="main-container">

        {/* ================================ */}
        {/* HEADER */}
        {/* ================================ */}

        <header className="header">
          <h1>🌿 Leaf Disease Detection</h1>

          <p>
            Upload a clear image of a leaf to detect diseases
          </p>

          <button
            className="dark-mode-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </header>

        {/* ================================ */}
        {/* UPLOAD SECTION */}
        {/* ================================ */}

        <section className="upload-section">
          <h2>📷 Upload Leaf Image</h2>

          <p>
            Upload a clear image or capture one using your camera
          </p>

          <div className="upload-buttons">

            <label
              htmlFor="image-input"
              className="choose-image-btn"
            >
              📁 Choose Image
            </label>

            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />

            <button
              className="camera-btn"
              onClick={openCamera}
            >
              📷 Open Camera
            </button>
          </div>

          {/* ================================ */}
          {/* CAMERA */}
          {/* ================================ */}

          {cameraError && (
            <div className="camera-error">
              ⚠️ {cameraError}
            </div>
          )}

          {cameraOpen && (
            <div className="camera-container">

              <video
                ref={videoRef}
                className="camera-video"
                autoPlay
                playsInline
              />

              <canvas
                ref={canvasRef}
                style={{ display: "none" }}
              />

              <div className="camera-actions">

                <button
                  className="capture-btn"
                  onClick={capturePhoto}
                >
                  📸 Capture Photo
                </button>

                <button
                  className="close-camera-btn"
                  onClick={stopCamera}
                >
                  ✖ Close Camera
                </button>

              </div>
            </div>
          )}

          {/* ================================ */}
          {/* IMAGE PREVIEW */}
          {/* ================================ */}

          {imagePreview && !cameraOpen && (
            <div className="image-preview-container">
              <img
                src={imagePreview}
                alt="Selected leaf"
                className="image-preview"
              />
            </div>
          )}

          {/* ================================ */}
          {/* DETECT BUTTON */}
          {/* ================================ */}

          <button
            className="detect-btn"
            onClick={detectDisease}
            disabled={loading}
          >
            {loading
              ? "⏳ Detecting..."
              : "🔍 Detect Disease"}
          </button>

          {/* ================================ */}
          {/* IMAGE QUALITY WARNING */}
          {/* ================================ */}

          {qualityWarning && (
            <div className="quality-warning">

              <h3>
                ⚠️ Image Quality Warning
              </h3>

              <p>
                {qualityWarning}
              </p>

              <span>
                📸 Please upload or capture a clear,
                well-lit and sharp leaf image.
              </span>

            </div>
          )}

        </section>

        {/* ================================ */}
        {/* RESULT */}
        {/* ================================ */}

        {result && (
          <section className="result-card">

            <h2>
              🌿 Disease Detection Result
            </h2>

            {/* ================================ */}
            {/* UNKNOWN LEAF */}
            {/* ================================ */}

            {(result.is_unknown || result.unknown) ? (
              <div className="unknown-result">

                <h3>
                  ⚠️ Unknown Leaf
                </h3>

                <p>
                  {result.message ||
                    "This leaf is not confidently recognized by the trained model."}
                </p>

                <div className="confidence-box">
                  📊 Confidence:{" "}
                  <strong>
                    {Number(
                      result.confidence || 0
                    ).toFixed(2)}
                    %
                  </strong>
                </div>

              </div>
            ) : (
              <>
                {/* ================================ */}
                {/* PLANT */}
                {/* ================================ */}

                <div className="result-item">
                  <span>🌱 Plant:</span>

                  <strong>
                    {result.plant || "Unknown"}
                  </strong>
                </div>

                {/* ================================ */}
                {/* DISEASE */}
                {/* ================================ */}

                <div className="result-item">
                  <span>🦠 Disease:</span>

                  <strong>
                    {result.disease || "Unknown"}
                  </strong>
                </div>

                {/* ================================ */}
                {/* CONFIDENCE */}
                {/* ================================ */}

                <div className="confidence-section">

                  <div className="confidence-text">

                    <span>
                      📊 Confidence
                    </span>

                    <strong>
                      {Number(
                        result.confidence || 0
                      ).toFixed(2)}
                      %
                    </strong>

                  </div>

                  <div className="confidence-bar">

                    <div
                      className="confidence-progress"
                      style={{
                        width: `${Math.min(
                          Number(
                            result.confidence || 0
                          ),
                          100
                        )}%`
                      }}
                    />

                  </div>

                </div>
              </>
            )}

            {/* ================================ */}
            {/* TREATMENT */}
            {/* ================================ */}

            {!result.is_unknown &&
              !result.unknown && (
                <div className="info-section">

                  <h3>
                    📖 About / Treatment
                  </h3>

                  <p>
                    {result.treatment ||
                      "No treatment information available."}
                  </p>

                </div>
              )}

            {/* ================================ */}
            {/* PREVENTION */}
            {/* ================================ */}

            {!result.is_unknown &&
              !result.unknown && (
                <div className="info-section">

                  <h3>
                    🛡️ Prevention
                  </h3>

                  <p>
                    {result.prevention ||
                      "No prevention information available."}
                  </p>

                </div>
              )}

            {/* ================================ */}
            {/* TOP 3 PREDICTIONS */}
            {/* ================================ */}

            {result.top_predictions &&
              result.top_predictions.length > 0 && (
                <div className="top-predictions">

                  <h3>
                    🏆 Top 3 Predictions
                  </h3>

                  {result.top_predictions.map(
                    (prediction, index) => {

                      const medals = [
                        "🥇",
                        "🥈",
                        "🥉"
                      ];

                      return (
                        <div
                          className="prediction-item"
                          key={index}
                        >

                          <span className="rank">
                            {medals[index] ||
                              `${index + 1}.`}
                          </span>

                          <div className="prediction-details">

                            <strong>
                              {prediction.plant} —
                              {" "}
                              {prediction.disease}
                            </strong>

                          </div>

                          <span className="prediction-confidence">

                            {Number(
                              prediction.confidence
                            ).toFixed(2)}
                            %

                          </span>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            {/* ================================ */}
            {/* STATUS */}
            {/* ================================ */}

            <div className="status-box">

              <strong>
                {result.is_unknown ||
                result.unknown
                  ? "⚠️ Status:"
                  : "☑️ Status:"}
              </strong>

              {" "}

              {result.status ||
                (result.is_unknown ||
                result.unknown
                  ? "Unknown Leaf"
                  : "Prediction completed successfully")}

            </div>

            {/* ================================ */}
            {/* DOWNLOAD PDF */}
            {/* ================================ */}

            <button
              className="download-btn"
              onClick={downloadPDF}
            >
              📄 Download PDF Report
            </button>

          </section>
        )}

        {/* ================================ */}
        {/* PREDICTION HISTORY */}
        {/* ================================ */}

        <section className="history-section">

          <div className="history-header">

            <h2>
              📜 Prediction History
            </h2>

            {history.length > 0 && (
              <button
                className="clear-history-btn"
                onClick={clearHistory}
              >
                🗑️ Clear History
              </button>
            )}

          </div>

          {history.length === 0 ? (

            <p className="no-history">
              No prediction history available.
            </p>

          ) : (

            <div className="history-list">

              {history.map(
                (item, index) => (
                  <div
                    className="history-item"
                    key={item.id}
                  >

                    <div className="history-number">
                      {index + 1}
                    </div>

                    <div className="history-content">

                      <p>
                        🌱 <strong>
                          Plant:
                        </strong>{" "}
                        {item.plant}
                      </p>

                      <p>
                        🦠 <strong>
                          Disease:
                        </strong>{" "}
                        {item.disease}
                      </p>

                      <p>
                        📊 <strong>
                          Confidence:
                        </strong>{" "}
                        {Number(
                          item.confidence || 0
                        ).toFixed(2)}
                        %
                      </p>

                      <p>
                        🕒 <strong>
                          Time:
                        </strong>{" "}
                        {item.time}
                      </p>

                      {item.isUnknown && (
                        <p className="history-unknown">
                          ⚠️ Unknown Leaf
                        </p>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default App;