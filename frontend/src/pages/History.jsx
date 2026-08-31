import { useEffect, useState } from "react";


function History() {

  const [history, setHistory] = useState([]);


  // =====================================
  // LOAD HISTORY
  // =====================================

  useEffect(() => {

    const loadHistory = () => {

      try {

        const savedHistory =
          JSON.parse(
            localStorage.getItem(
              "predictionHistory"
            ) || "[]"
          );

        setHistory(
          Array.isArray(savedHistory)
            ? savedHistory
            : []
        );

      } catch (error) {

        console.error(
          "History load error:",
          error
        );

        setHistory([]);

      }

    };


    loadHistory();


    // Refresh history if storage changes
    window.addEventListener(
      "storage",
      loadHistory
    );


    return () => {

      window.removeEventListener(
        "storage",
        loadHistory
      );

    };

  }, []);


  // =====================================
  // CLEAR HISTORY
  // =====================================

  const clearHistory = () => {

    const confirmClear =
      window.confirm(
        "Are you sure you want to clear prediction history?"
      );


    if (!confirmClear) {
      return;
    }


    localStorage.removeItem(
      "predictionHistory"
    );


    setHistory([]);

  };


  // =====================================
  // FORMAT CONFIDENCE
  // =====================================

  const getConfidence = (confidence) => {

    const value =
      Number(confidence || 0);

    return value.toFixed(2);

  };


  // =====================================
  // UNKNOWN CHECK
  // =====================================

  const isUnknownPrediction = (item) => {

    return (
      item?.isUnknown === true ||
      item?.is_unknown === true ||
      item?.plant === "Unknown" ||
      item?.disease === "Unknown"
    );

  };


  return (

    <div className="history-page">

      {/* =================================
          HEADER
      ================================== */}

      <div className="history-page-header">

        <span className="page-badge">
          📜 HISTORY
        </span>

        <h1>
          Prediction History
        </h1>

        <p>
          View all your previous leaf disease
          detection results.
        </p>

      </div>


      {/* =================================
          HISTORY CONTAINER
      ================================== */}

      <div className="history-container">


        {/* =================================
            TOP HEADER
        ================================== */}

        <div className="history-top">

          <div>

            <h2>
              📋 Previous Predictions
            </h2>

            <p>
              {history.length}{" "}
              {history.length === 1
                ? "prediction"
                : "predictions"}{" "}
              saved
            </p>

          </div>


          {/* CLEAR BUTTON */}

          {history.length > 0 && (

            <button
              className="clear-history-btn"
              onClick={clearHistory}
              type="button"
            >
              🗑️ Clear History
            </button>

          )}

        </div>


        {/* =================================
            EMPTY HISTORY
        ================================== */}

        {history.length === 0 ? (

          <div className="empty-history">

            <div className="empty-history-icon">
              📭
            </div>

            <h2>
              No Prediction History
            </h2>

            <p>
              You haven't made any disease
              predictions yet.
            </p>

          </div>

        ) : (


          /* =================================
             HISTORY LIST
          ================================== */

          <div className="history-list">

            {history.map(
              (item, index) => {

                const unknown =
                  isUnknownPrediction(
                    item
                  );


                return (

                  <div
                    className="history-card"
                    key={
                      item.id ||
                      `${item.time}-${index}`
                    }
                  >


                    {/* =========================
                        NUMBER
                    ========================== */}

                    <div className="history-index">

                      {index + 1}

                    </div>


                    {/* =========================
                        CONTENT
                    ========================== */}

                    <div className="history-card-content">


                      {/* =========================
                          TOP
                      ========================== */}

                      <div className="history-card-top">

                        <h3>
                          {unknown
                            ? "⚠️ Unknown Leaf"
                            : "🌿 Disease Prediction"}
                        </h3>


                        <span className="history-time">
                          🕒{" "}
                          {item.time ||
                            item.timestamp ||
                            "Time unavailable"}
                        </span>

                      </div>


                      {/* =========================
                          PLANT
                      ========================== */}

                      <div className="history-detail">

                        <span>
                          🌱 Plant
                        </span>

                        <strong>
                          {item.plant ||
                            "Unknown"}
                        </strong>

                      </div>


                      {/* =========================
                          DISEASE
                      ========================== */}

                      <div className="history-detail">

                        <span>
                          🦠 Disease
                        </span>

                        <strong>
                          {item.disease ||
                            "Unknown"}
                        </strong>

                      </div>


                      {/* =========================
                          CONFIDENCE
                      ========================== */}

                      <div className="history-detail">

                        <span>
                          🎯 Confidence
                        </span>

                        <strong>
                          {getConfidence(
                            item.confidence
                          )}
                          %
                        </strong>

                      </div>


                      {/* =========================
                          CONFIDENCE BAR
                      ========================== */}

                      <div className="history-confidence-bar">

                        <div
                          className={
                            unknown
                              ? "history-confidence-progress unknown"
                              : "history-confidence-progress"
                          }
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                Number(
                                  item.confidence ||
                                  0
                                )
                              )
                            )}%`
                          }}
                        />

                      </div>


                      {/* =========================
                          UNKNOWN MESSAGE
                      ========================== */}

                      {unknown && (

                        <p
                          className="history-unknown"
                          style={{
                            marginTop: "12px"
                          }}
                        >
                          ⚠️ This image could not
                          be confidently identified.
                        </p>

                      )}


                      {/* =========================
                          TOP 3 PREDICTIONS
                      ========================== */}

                      {Array.isArray(
                        item.top_predictions
                      ) &&
                        item.top_predictions.length >
                          0 && (

                        <div
                          className="history-top-predictions"
                          style={{
                            marginTop: "18px"
                          }}
                        >

                          <strong>
                            🏆 Top Predictions
                          </strong>


                          <div
                            style={{
                              marginTop: "10px"
                            }}
                          >

                            {item.top_predictions
                              .slice(0, 3)
                              .map(
                                (
                                  prediction,
                                  predictionIndex
                                ) => (

                                  <div
                                    key={
                                      predictionIndex
                                    }
                                    style={{
                                      display:
                                        "flex",
                                      justifyContent:
                                        "space-between",
                                      gap:
                                        "10px",
                                      padding:
                                        "7px 0",
                                      borderTop:
                                        "1px solid #eef2ee"
                                    }}
                                  >

                                    <span>

                                      {predictionIndex ===
                                      0
                                        ? "🥇"
                                        : predictionIndex ===
                                          1
                                        ? "🥈"
                                        : "🥉"}

                                      {" "}

                                      {prediction.plant ||
                                        "Unknown"}

                                      {" — "}

                                      {prediction.disease ||
                                        "Unknown"}

                                    </span>


                                    <strong>

                                      {getConfidence(
                                        prediction.confidence
                                      )}
                                      %

                                    </strong>

                                  </div>

                                )
                              )}

                          </div>

                        </div>

                      )}

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>

    </div>

  );

}


export default History;