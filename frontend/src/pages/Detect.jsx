import {
  useState,
  useRef,
  useEffect
} from "react";

import jsPDF from "jspdf";


function Detect() {

  // =====================================
  // STATE
  // =====================================

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [qualityChecking, setQualityChecking] =
    useState(false);

  const [imageQuality, setImageQuality] =
    useState(null);

  const [qualityWarning, setQualityWarning] =
    useState("");


  // =====================================
  // REFS
  // =====================================

  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  const streamRef = useRef(null);


  // =====================================
  // STOP CAMERA
  // =====================================

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


  // =====================================
  // CAMERA CLEANUP
  // =====================================

  useEffect(() => {

    return () => {

      if (streamRef.current) {

        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

      }

      if (imagePreview) {

        URL.revokeObjectURL(
          imagePreview
        );

      }

    };

  }, [imagePreview]);


  // =====================================
  // IMAGE QUALITY ANALYSIS
  // =====================================

  const analyzeImageQuality =
    async (file) => {

      if (!file) return;


      setQualityChecking(true);

      setImageQuality(null);


      try {

        const image = new Image();

        const imageUrl =
          URL.createObjectURL(file);


        image.src = imageUrl;


        await new Promise(
          (resolve, reject) => {

            image.onload = resolve;

            image.onerror = reject;

          }
        );


        const width =
          image.naturalWidth;

        const height =
          image.naturalHeight;


        // =================================
        // CANVAS
        // =================================

        const canvas =
          document.createElement(
            "canvas"
          );


        const maxSize = 300;


        const scale =
          Math.min(
            1,
            maxSize /
              Math.max(
                width,
                height
              )
          );


        canvas.width =
          Math.max(
            1,
            Math.floor(
              width * scale
            )
          );


        canvas.height =
          Math.max(
            1,
            Math.floor(
              height * scale
            )
          );


        const context =
          canvas.getContext(
            "2d",
            {
              willReadFrequently: true
            }
          );


        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );


        // =================================
        // PIXELS
        // =================================

        const imageData =
          context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );


        const pixels =
          imageData.data;


        let brightnessTotal = 0;


        // =================================
        // BRIGHTNESS
        // =================================

        for (
          let i = 0;
          i < pixels.length;
          i += 4
        ) {

          const red =
            pixels[i];

          const green =
            pixels[i + 1];

          const blue =
            pixels[i + 2];


          const brightness =
            (
              red +
              green +
              blue
            ) / 3;


          brightnessTotal +=
            brightness;

        }


        const totalPixels =
          pixels.length / 4;


        const averageBrightness =
          brightnessTotal /
          totalPixels;


        // =================================
        // SHARPNESS
        // =================================

        const grayValues = [];


        for (
          let i = 0;
          i < pixels.length;
          i += 4
        ) {

          const gray =
            (
              pixels[i] +
              pixels[i + 1] +
              pixels[i + 2]
            ) / 3;


          grayValues.push(gray);

        }


        let sharpnessTotal = 0;

        let sharpnessCount = 0;


        const canvasWidth =
          canvas.width;

        const canvasHeight =
          canvas.height;


        for (
          let y = 1;
          y < canvasHeight - 1;
          y++
        ) {

          for (
            let x = 1;
            x < canvasWidth - 1;
            x++
          ) {

            const currentIndex =
              y * canvasWidth + x;


            const rightIndex =
              y * canvasWidth +
              (x + 1);


            const bottomIndex =
              (y + 1) *
                canvasWidth +
              x;


            const difference =
              Math.abs(
                grayValues[currentIndex] -
                grayValues[rightIndex]
              ) +
              Math.abs(
                grayValues[currentIndex] -
                grayValues[bottomIndex]
              );


            sharpnessTotal +=
              difference;


            sharpnessCount++;

          }

        }


        const averageSharpness =
          sharpnessCount > 0
            ? sharpnessTotal /
              sharpnessCount
            : 0;


        // =================================
        // RESOLUTION SCORE
        // =================================

        const resolution =
          width * height;


        let resolutionScore = 0;


        if (
          resolution >=
          1920 * 1080
        ) {

          resolutionScore = 100;

        } else if (
          resolution >=
          1280 * 720
        ) {

          resolutionScore = 90;

        } else if (
          resolution >=
          800 * 600
        ) {

          resolutionScore = 75;

        } else if (
          resolution >=
          640 * 480
        ) {

          resolutionScore = 60;

        } else {

          resolutionScore = 40;

        }


        // =================================
        // BRIGHTNESS SCORE
        // =================================

        let brightnessScore = 100;


        if (
          averageBrightness < 40
        ) {

          brightnessScore = 30;

        } else if (
          averageBrightness < 70
        ) {

          brightnessScore = 60;

        } else if (
          averageBrightness > 220
        ) {

          brightnessScore = 50;

        } else if (
          averageBrightness > 190
        ) {

          brightnessScore = 80;

        }


        // =================================
        // SHARPNESS SCORE
        // =================================

        let sharpnessScore = 0;


        if (
          averageSharpness >= 35
        ) {

          sharpnessScore = 100;

        } else if (
          averageSharpness >= 25
        ) {

          sharpnessScore = 85;

        } else if (
          averageSharpness >= 15
        ) {

          sharpnessScore = 70;

        } else if (
          averageSharpness >= 8
        ) {

          sharpnessScore = 50;

        } else {

          sharpnessScore = 30;

        }


        // =================================
        // FINAL QUALITY SCORE
        // =================================

        const finalScore =
          Math.round(
            resolutionScore * 0.35 +
            brightnessScore * 0.30 +
            sharpnessScore * 0.35
          );


        let status = "";

        let message = "";

        let className = "";


        if (
          finalScore >= 80
        ) {

          status = "Good";

          message =
            "Excellent image quality. This image is suitable for disease detection.";

          className = "good";

        } else if (
          finalScore >= 60
        ) {

          status = "Fair";

          message =
            "Image quality is acceptable, but a clearer image may improve prediction accuracy.";

          className = "fair";

        } else {

          status = "Poor";

          message =
            "Image quality is low. Please upload a clearer and sharper leaf image.";

          className = "poor";

        }


        // =================================
        // SAVE QUALITY
        // =================================

        setImageQuality({

          score: finalScore,

          status,

          message,

          className,

          width,

          height,

          brightness:
            Math.round(
              averageBrightness
            ),

          sharpness:
            Math.round(
              averageSharpness
            )

        });


        URL.revokeObjectURL(
          imageUrl
        );


      } catch (error) {

        console.error(
          "Image quality error:",
          error
        );


        setImageQuality({

          score: 0,

          status: "Poor",

          message:
            "Unable to analyze image quality.",

          className: "poor",

          width: 0,

          height: 0,

          brightness: 0,

          sharpness: 0

        });

      } finally {

        setQualityChecking(
          false
        );

      }

    };


  // =====================================
  // IMAGE FILE CHANGE
  // =====================================

  const handleImageChange =
    async (event) => {

      const file =
        event.target.files?.[0];


      if (!file) return;


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "Please select a valid image file."
        );

        event.target.value = "";

        return;

      }


      stopCamera();


      if (imagePreview) {

        URL.revokeObjectURL(
          imagePreview
        );

      }


      // Reset previous prediction
      setResult(null);

      setQualityWarning("");

      setImageQuality(null);


      setSelectedImage(
        file
      );


      const previewUrl =
        URL.createObjectURL(
          file
        );


      setImagePreview(
        previewUrl
      );


      await analyzeImageQuality(
        file
      );


      // Allow selecting same file again
      event.target.value = "";

    };
  // =====================================
  // OPEN CAMERA
  // =====================================

  const openCamera = async () => {

    try {

      setCameraError("");

      stopCamera();


      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: {
            facingMode: {
              ideal: "environment"
            },

            width: {
              ideal: 1280
            },

            height: {
              ideal: 720
            }
          },

          audio: false

        });


      streamRef.current =
        stream;


      setCameraOpen(
        true
      );


      setTimeout(() => {

        if (videoRef.current) {

          videoRef.current.srcObject =
            stream;


          videoRef.current
            .play()
            .catch((error) => {

              console.error(
                "Camera play error:",
                error
              );

            });

        }

      }, 100);


    } catch (error) {

      console.error(
        "Camera error:",
        error
      );


      setCameraError(
        "Unable to access camera. Please allow camera permission."
      );


      setCameraOpen(
        false
      );

    }

  };


  // =====================================
  // CAPTURE PHOTO
  // =====================================

  const capturePhoto = () => {

    if (
      !videoRef.current ||
      !canvasRef.current
    ) {

      return;

    }


    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;


    const width =
      video.videoWidth;

    const height =
      video.videoHeight;


    if (
      !width ||
      !height
    ) {

      alert(
        "Camera is not ready yet. Please wait a moment."
      );

      return;

    }


    canvas.width =
      width;

    canvas.height =
      height;


    const context =
      canvas.getContext("2d");


    context.drawImage(
      video,
      0,
      0,
      width,
      height
    );


    canvas.toBlob(
      async (blob) => {

        if (!blob) {

          alert(
            "Failed to capture image."
          );

          return;

        }


        const capturedFile =
          new File(
            [blob],
            `leaf_capture_${Date.now()}.jpg`,
            {
              type: "image/jpeg"
            }
          );


        stopCamera();


        if (imagePreview) {

          URL.revokeObjectURL(
            imagePreview
          );

        }


        // Reset previous result

        setResult(null);

        setImageQuality(null);

        setQualityWarning("");


        // Set captured image

        setSelectedImage(
          capturedFile
        );


        const previewUrl =
          URL.createObjectURL(
            capturedFile
          );


        setImagePreview(
          previewUrl
        );


        // Analyze quality

        await analyzeImageQuality(
          capturedFile
        );

      },

      "image/jpeg",

      0.92

    );

  };


  // =====================================
  // SAVE PREDICTION HISTORY
  // =====================================

  const saveToHistory =
    (predictionResult) => {

      try {

        // IMPORTANT:
        // Same key used by History.jsx
        // and Analytics.jsx

        const HISTORY_KEY =
          "predictionHistory";


        const existingHistory =
          JSON.parse(
            localStorage.getItem(
              HISTORY_KEY
            ) || "[]"
          );


        const newHistoryItem = {

          id:
            Date.now(),

          plant:
            predictionResult.plant ||
            "Unknown",

          disease:
            predictionResult.disease ||
            "Unknown",

          confidence:
            Number(
              predictionResult.confidence ||
              0
            ),

          isUnknown:
            predictionResult.isUnknown === true,

          timestamp:
            new Date().toLocaleString(),

          // Keep time also for compatibility

          time:
            new Date().toLocaleString(),

          top_predictions:
            Array.isArray(
              predictionResult.top_predictions
            )
              ? predictionResult.top_predictions
              : []

        };


        const updatedHistory = [

          newHistoryItem,

          ...existingHistory

        ].slice(
          0,
          20
        );


        localStorage.setItem(

          HISTORY_KEY,

          JSON.stringify(
            updatedHistory
          )

        );


        console.log(
          "Prediction saved to history:",
          newHistoryItem
        );


      } catch (error) {

        console.error(
          "History save error:",
          error
        );

      }

    };


  // =====================================
  // DETECT DISEASE
  // =====================================

  const detectDisease =
    async () => {

      // ---------------------------------
      // CHECK IMAGE
      // ---------------------------------

      if (!selectedImage) {

        alert(
          "Please choose or capture a leaf image first."
        );

        return;

      }


      // ---------------------------------
      // QUALITY WARNING
      // ---------------------------------

      if (
        imageQuality &&
        imageQuality.score < 50
      ) {

        setQualityWarning(
          "⚠️ This image has poor quality. Prediction accuracy may be affected."
        );

      } else {

        setQualityWarning("");

      }


      // ---------------------------------
      // START LOADING
      // ---------------------------------

      setLoading(true);

      // VERY IMPORTANT:
      // Remove old prediction while
      // new prediction is running.

      setResult(null);


      try {

        // ---------------------------------
        // FORM DATA
        // ---------------------------------

        const formData =
          new FormData();


        formData.append(
          "file",
          selectedImage
        );


        // ---------------------------------
        // BACKEND REQUEST
        // ---------------------------------

        const response =
          await fetch(
            "http://127.0.0.1:8000/predict",
            {
              method: "POST",
              body: formData
            }
          );


        // ---------------------------------
        // SERVER ERROR
        // ---------------------------------

        if (!response.ok) {

          throw new Error(
            `Server error: ${response.status}`
          );

        }


        // ---------------------------------
        // JSON RESPONSE
        // ---------------------------------

        const data =
          await response.json();


        console.log(
          "Prediction response:",
          data
        );


        // =================================
        // NORMALIZE BACKEND RESPONSE
        // =================================

        const confidence =
          Number(
            data.confidence || 0
          );


        /*
          Backend is using 60% threshold.

          If backend sends is_unknown,
          use that.

          Otherwise calculate it here
          as an additional safety check.
        */

        const isUnknown =
          data.is_unknown === true ||
          data.isUnknown === true ||
          confidence < 60 ||
          data.plant === "Unknown" ||
          data.disease === "Unknown";


        const normalizedResult = {

          plant:
            data.plant ||
            "Unknown",

          disease:
            data.disease ||
            "Unknown",

          confidence,

          treatment:
            data.treatment ||
            "No treatment information available.",

          prevention:
            data.prevention ||
            "No prevention information available.",

          status:
            data.status ||
            (
              isUnknown
                ? "Low confidence prediction"
                : "Prediction completed successfully"
            ),

          isUnknown,

          top_predictions:
            Array.isArray(
              data.top_predictions
            )
              ? data.top_predictions
              : []

        };


        // =================================
        // SET RESULT
        // =================================

        setResult(
          normalizedResult
        );


        // =================================
        // SAVE HISTORY
        // =================================

        saveToHistory(
          normalizedResult
        );


      } catch (error) {

        console.error(
          "Prediction error:",
          error
        );


        // ---------------------------------
        // ERROR RESULT
        // ---------------------------------

        const errorResult = {

          plant:
            "Unknown",

          disease:
            "Unknown",

          confidence:
            0,

          treatment:
            "Unable to process the uploaded image.",

          prevention:
            "Please check that the backend server is running and upload a clear leaf image.",

          status:
            "Prediction failed",

          isUnknown:
            true,

          top_predictions:
            []

        };


        setResult(
          errorResult
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  // =====================================
  // DOWNLOAD PDF REPORT
  // =====================================

  const downloadPDF = () => {

    if (!result) {

      alert(
        "Please detect a disease first."
      );

      return;

    }


    const pdf =
      new jsPDF();


    const topPredictions =
      result.top_predictions || [];


    // =================================
    // TITLE
    // =================================

    pdf.setFontSize(22);

    pdf.text(
      "Leaf Disease Detection Report",
      20,
      20
    );


    pdf.setFontSize(12);


    let y = 40;


    // =================================
    // BASIC DETAILS
    // =================================

    pdf.text(
      `Plant: ${result.plant}`,
      20,
      y
    );


    y += 10;


    pdf.text(
      `Disease: ${result.disease}`,
      20,
      y
    );


    y += 10;


    pdf.text(
      `Confidence: ${result.confidence.toFixed(2)}%`,
      20,
      y
    );


    y += 10;


    pdf.text(
      `Status: ${result.status}`,
      20,
      y
    );


    // =================================
    // TREATMENT
    // =================================

    y += 20;


    pdf.setFontSize(16);


    pdf.text(
      "About / Treatment",
      20,
      y
    );


    y += 10;


    pdf.setFontSize(11);


    const treatmentLines =
      pdf.splitTextToSize(
        result.treatment,
        170
      );


    pdf.text(
      treatmentLines,
      20,
      y
    );


    y +=
      treatmentLines.length * 6 +
      12;


    // =================================
    // PREVENTION
    // =================================

    pdf.setFontSize(16);


    pdf.text(
      "Prevention",
      20,
      y
    );


    y += 10;


    pdf.setFontSize(11);


    const preventionLines =
      pdf.splitTextToSize(
        result.prevention,
        170
      );


    pdf.text(
      preventionLines,
      20,
      y
    );


    y +=
      preventionLines.length * 6 +
      15;


    // =================================
    // TOP PREDICTIONS
    // =================================

    if (
      topPredictions.length > 0
    ) {

      pdf.setFontSize(16);


      pdf.text(
        "Top Predictions",
        20,
        y
      );


      y += 12;


      pdf.setFontSize(11);


      topPredictions
        .slice(0, 3)
        .forEach(
          (
            prediction,
            index
          ) => {

            const predictionConfidence =
              Number(
                prediction.confidence ||
                0
              ).toFixed(2);


            const text =
              `${index + 1}. ` +
              `${prediction.plant || "Unknown"} - ` +
              `${prediction.disease || "Unknown"} - ` +
              `${predictionConfidence}%`;


            pdf.text(
              text,
              20,
              y
            );


            y += 8;

          }
        );

    }


    // =================================
    // IMAGE QUALITY
    // =================================

    if (imageQuality) {

      y += 10;


      pdf.setFontSize(16);


      pdf.text(
        "Image Quality",
        20,
        y
      );


      y += 10;


      pdf.setFontSize(11);


      pdf.text(
        `Quality Score: ${imageQuality.score}%`,
        20,
        y
      );


      y += 8;


      pdf.text(
        `Status: ${imageQuality.status}`,
        20,
        y
      );


      y += 8;


      pdf.text(
        `Resolution: ${imageQuality.width} x ${imageQuality.height}`,
        20,
        y
      );


      y += 8;


      pdf.text(
        `Brightness: ${imageQuality.brightness}/255`,
        20,
        y
      );


      y += 8;


      pdf.text(
        `Sharpness: ${imageQuality.sharpness}`,
        20,
        y
      );

    }


    // =================================
    // SAVE
    // =================================

    pdf.save(
      "leaf-disease-report.pdf"
    );

  };


  // =====================================
  // CLEAR DETECTION
  // =====================================

  const clearDetection = () => {

    if (imagePreview) {

      URL.revokeObjectURL(
        imagePreview
      );

    }


    setSelectedImage(
      null
    );

    setImagePreview(
      null
    );

    setResult(
      null
    );

    setImageQuality(
      null
    );

    setQualityWarning(
      ""
    );

    setCameraError(
      ""
    );


    stopCamera();

  };
  return (

    <div className="detect-page">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <section className="detect-header">

        <span className="page-badge">
          🔍 AI DETECTION
        </span>

        <h1>
          Detect Plant Disease
        </h1>

        <p>
          Upload a clear leaf image or capture one
          using your camera.
        </p>

      </section>


      {/* =====================================
          UPLOAD SECTION
      ====================================== */}

      <section className="detect-card">

        <div className="detect-card-header">

          <h2>
            📷 Upload Leaf Image
          </h2>

          <p>
            Upload a clear image or capture one
            using your camera.
          </p>

        </div>


        {/* =================================
            ACTION BUTTONS
        ================================== */}

        <div className="upload-actions">

          {/* CHOOSE IMAGE */}

          <label
            htmlFor="leaf-image-input"
            className="choose-image-btn"
          >
            📁 Choose Image
          </label>


          <input
            id="leaf-image-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              display: "none"
            }}
          />


          {/* CAMERA */}

          {!cameraOpen && (

            <button
              type="button"
              className="camera-btn"
              onClick={openCamera}
            >
              📷 Open Camera
            </button>

          )}

        </div>


        {/* =================================
            CAMERA ERROR
        ================================== */}

        {cameraError && (

          <div className="camera-error">

            ⚠️ {cameraError}

          </div>

        )}


        {/* =================================
            CAMERA
        ================================== */}

        {cameraOpen && (

          <div className="camera-container">

            <video
              ref={videoRef}
              className="camera-video"
              autoPlay
              playsInline
              muted
            />


            <canvas
              ref={canvasRef}
              style={{
                display: "none"
              }}
            />


            <div className="camera-actions">

              <button
                type="button"
                className="capture-btn"
                onClick={capturePhoto}
              >
                📸 Capture Photo
              </button>


              <button
                type="button"
                className="close-camera-btn"
                onClick={stopCamera}
              >
                ✕ Close Camera
              </button>

            </div>

          </div>

        )}


        {/* =================================
            IMAGE PREVIEW
        ================================== */}

        {imagePreview && (

          <div className="image-preview-container">

            <img
              src={imagePreview}
              alt="Selected leaf"
              className="leaf-preview"
            />


            <button
              type="button"
              className="remove-image-btn"
              onClick={clearDetection}
            >
              ❌ Remove Image
            </button>

          </div>

        )}


        {/* =================================
            IMAGE QUALITY
        ================================== */}

        {qualityChecking && (

          <div className="quality-loading">

            <div className="quality-spinner">
              ⏳
            </div>

            <p>
              Analyzing image quality...
            </p>

          </div>

        )}


        {imageQuality && !qualityChecking && (

          <div
            className={`image-quality-card ${imageQuality.className}`}
          >

            {/* QUALITY HEADER */}

            <div className="quality-header">

              <h3>
                🖼️ Image Quality Check
              </h3>

              <span className="quality-score">

                {imageQuality.score}%

              </span>

            </div>


            {/* QUALITY BAR */}

            <div className="quality-progress">

              <div
                className="quality-progress-fill"
                style={{
                  width: `${imageQuality.score}%`
                }}
              />

            </div>


            {/* STATUS */}

            <div className="quality-status">

              <strong>
                Status:
              </strong>

              <span>
                {imageQuality.status}
              </span>

            </div>


            <p className="quality-message">

              {imageQuality.message}

            </p>


            {/* QUALITY DETAILS */}

            <div className="quality-details">


              <div className="quality-detail">

                <span>
                  📐 Resolution
                </span>

                <strong>
                  {imageQuality.width} ×{" "}
                  {imageQuality.height}
                </strong>

              </div>


              <div className="quality-detail">

                <span>
                  ☀️ Brightness
                </span>

                <strong>
                  {imageQuality.brightness}/255
                </strong>

              </div>


              <div className="quality-detail">

                <span>
                  🔎 Sharpness
                </span>

                <strong>
                  {imageQuality.sharpness}
                </strong>

              </div>

            </div>

          </div>

        )}


        {/* =================================
            QUALITY WARNING
        ================================== */}

        {qualityWarning && (

          <div className="quality-warning">

            {qualityWarning}

          </div>

        )}


        {/* =================================
            DETECT BUTTON
        ================================== */}

        {selectedImage && (

          <button
            type="button"
            className="detect-button"
            onClick={detectDisease}
            disabled={
              loading ||
              qualityChecking
            }
          >

            {loading ? (

              <>
                ⏳ Analyzing Leaf...
              </>

            ) : (

              <>
                🔍 Detect Disease
              </>

            )}

          </button>

        )}

      </section>


      {/* =====================================
          LOADING RESULT
      ====================================== */}

      {loading && (

        <section className="prediction-loading">

          <div className="prediction-spinner">
            🌿
          </div>

          <h2>
            AI is analyzing your leaf...
          </h2>

          <p>
            Please wait while the model
            processes your image.
          </p>

        </section>

      )}


      {/* =====================================
          UNKNOWN / LOW CONFIDENCE RESULT
          ONLY AFTER PREDICTION
      ====================================== */}

      {!loading &&
        result &&
        result.isUnknown && (

          <section className="unknown-result">

            <div className="unknown-icon">
              ❓
            </div>

            <h2>
              Unknown Leaf / Low Confidence
            </h2>

            <p>
              We could not confidently identify
              this image as one of the diseases
              known to the AI model.
            </p>

            <div className="unknown-confidence">

              Confidence:{" "}

              {Number(
                result.confidence || 0
              ).toFixed(2)}

              %

            </div>

            <p className="unknown-help">

              Please upload a clear image of a
              supported plant leaf.

            </p>

          </section>

        )}


      {/* =====================================
          NORMAL PREDICTION RESULT
          ONLY WHEN CONFIDENCE >= 60
      ====================================== */}

      {!loading &&
        result &&
        !result.isUnknown && (

          <section className="prediction-result">

            {/* =================================
                RESULT HEADER
            ================================== */}

            <div className="result-header">

              <span className="result-badge">
                ✅ DETECTION COMPLETE
              </span>

              <h2>
                🧬 Disease Detection Result
              </h2>

              <p>
                AI model successfully analyzed
                your leaf image.
              </p>

            </div>


            {/* =================================
                MAIN RESULT
            ================================== */}

            <div className="result-main-card">

              {/* PLANT */}

              <div className="result-row">

                <span>
                  🌱 Plant
                </span>

                <strong>
                  {result.plant}
                </strong>

              </div>


              {/* DISEASE */}

              <div className="result-row">

                <span>
                  🦠 Disease
                </span>

                <strong>
                  {result.disease}
                </strong>

              </div>


              {/* CONFIDENCE */}

              <div className="confidence-section">

                <div className="confidence-header">

                  <span>
                    🎯 Confidence
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
                    className="confidence-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          Number(
                            result.confidence ||
                            0
                          )
                        )
                      )}%`
                    }}
                  />

                </div>

              </div>

            </div>


            {/* =================================
                TOP 3 PREDICTIONS
            ================================== */}

            {Array.isArray(
              result.top_predictions
            ) &&
              result.top_predictions.length >
                0 && (

                <div className="top-predictions">

                  <h3>
                    🏆 Top 3 Predictions
                  </h3>


                  <div className="prediction-list">

                    {result.top_predictions
                      .slice(0, 3)
                      .map(
                        (
                          prediction,
                          index
                        ) => (

                          <div
                            className="prediction-item"
                            key={index}
                          >

                            <span className="prediction-rank">

                              {index === 0
                                ? "🥇"
                                : index === 1
                                ? "🥈"
                                : "🥉"}

                            </span>


                            <div className="prediction-name">

                              <strong>

                                {prediction.plant ||
                                  result.plant ||
                                  "Unknown"}

                              </strong>

                              <span>

                                {prediction.disease ||
                                  "Unknown"}

                              </span>

                            </div>


                            <strong className="prediction-percent">

                              {Number(
                                prediction.confidence ||
                                0
                              ).toFixed(2)}

                              %

                            </strong>

                          </div>

                        )
                      )}

                  </div>

                </div>

              )}


            {/* =================================
                TREATMENT
            ================================== */}

            <div className="result-info-card">

              <h3>
                💊 About / Treatment
              </h3>

              <p>
                {result.treatment}
              </p>

            </div>


            {/* =================================
                PREVENTION
            ================================== */}

            <div className="result-info-card">

              <h3>
                🛡️ Prevention
              </h3>

              <p>
                {result.prevention}
              </p>

            </div>


            {/* =================================
                STATUS
            ================================== */}

            <div className="result-status">

              <span>
                ℹ️
              </span>

              <p>
                {result.status}
              </p>

            </div>


            {/* =================================
                ACTION BUTTONS
            ================================== */}

            <div className="result-actions">

              <button
                type="button"
                className="new-detection-btn"
                onClick={clearDetection}
              >
                🔄 New Detection
              </button>


              <button
                type="button"
                className="download-btn"
                onClick={downloadPDF}
              >
                📄 Download PDF Report
              </button>

            </div>

          </section>

        )}

    </div>

  );

}


export default Detect;