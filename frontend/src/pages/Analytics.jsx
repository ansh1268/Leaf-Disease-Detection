import {
  useEffect,
  useMemo,
  useState
} from "react";


function Analytics() {

  // =====================================
  // STATE
  // =====================================

  const [history, setHistory] =
    useState([]);


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
          "Analytics history error:",
          error
        );

        setHistory([]);

      }

    };


    loadHistory();


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
  // BASIC STATISTICS
  // =====================================

  const totalPredictions =
    history.length;


  const unknownPredictions =
    history.filter(
      (item) =>
        item?.isUnknown === true ||
        item?.is_unknown === true ||
        item?.plant === "Unknown" ||
        item?.disease === "Unknown"
    ).length;


  const successfulPredictions =
    totalPredictions -
    unknownPredictions;


  // =====================================
  // AVERAGE CONFIDENCE
  // =====================================

  const averageConfidence =
    useMemo(() => {

      if (
        history.length === 0
      ) {

        return 0;

      }


      const total =
        history.reduce(
          (sum, item) =>
            sum +
            Number(
              item?.confidence || 0
            ),
          0
        );


      return (
        total /
        history.length
      );

    }, [history]);


  // =====================================
  // HIGHEST CONFIDENCE
  // =====================================

  const highestConfidence =
    useMemo(() => {

      if (
        history.length === 0
      ) {

        return 0;

      }


      return Math.max(
        ...history.map(
          (item) =>
            Number(
              item?.confidence || 0
            )
        )
      );

    }, [history]);


  // =====================================
  // DISEASE FREQUENCY
  // =====================================

  const diseaseStats =
    useMemo(() => {

      const stats = {};


      history.forEach(
        (item) => {

          const disease =
            item?.disease ||
            "Unknown";


          if (
            disease === "Unknown" ||
            disease ===
              "Image Quality Warning"
          ) {

            return;

          }


          stats[disease] =
            (stats[disease] || 0) +
            1;

        }
      );


      return Object.entries(
        stats
      )
        .sort(
          (a, b) =>
            b[1] - a[1]
        )
        .slice(0, 6);

    }, [history]);


  // =====================================
  // PLANT FREQUENCY
  // =====================================

  const plantStats =
    useMemo(() => {

      const stats = {};


      history.forEach(
        (item) => {

          const plant =
            item?.plant ||
            "Unknown";


          if (
            plant === "Unknown"
          ) {

            return;

          }


          stats[plant] =
            (stats[plant] || 0) +
            1;

        }
      );


      return Object.entries(
        stats
      )
        .sort(
          (a, b) =>
            b[1] - a[1]
        )
        .slice(0, 6);

    }, [history]);


  // =====================================
  // CONFIDENCE STATUS
  // =====================================

  const getConfidenceStatus =
    () => {

      if (
        averageConfidence >= 80
      ) {

        return "Excellent";

      }


      if (
        averageConfidence >= 60
      ) {

        return "Good";

      }


      if (
        averageConfidence >= 40
      ) {

        return "Fair";

      }


      return "Low";

    };


  // =====================================
  // CLEAR ANALYTICS
  // =====================================

  const clearAnalytics = () => {

    const confirmClear =
      window.confirm(
        "Clear all prediction history and analytics?"
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
  // EMPTY STATE
  // =====================================

  if (
    history.length === 0
  ) {

    return (

      <div className="analytics-page">

        <div className="analytics-header">

          <span className="page-badge">
            📊 ANALYTICS
          </span>


          <h1>
            Prediction Analytics
          </h1>


          <p>
            Analyze your leaf disease
            detection history and
            prediction performance.
          </p>

        </div>


        <div className="analytics-empty">

          <div className="analytics-empty-icon">
            📊
          </div>


          <h2>
            No Analytics Available
          </h2>


          <p>
            Make some disease predictions
            first. Your analytics will
            appear here.
          </p>

        </div>

      </div>

    );

  }


  // =====================================
  // MAIN ANALYTICS
  // =====================================

  return (

    <div className="analytics-page">


      {/* =================================
          HEADER
      ================================== */}

      <div className="analytics-header">

        <div>

          <span className="page-badge">
            📊 ANALYTICS
          </span>


          <h1>
            Prediction Analytics
          </h1>


          <p>
            Overview of your leaf disease
            detection performance.
          </p>

        </div>


        <button
          className="analytics-clear-btn"
          onClick={clearAnalytics}
          type="button"
        >
          🗑️ Clear Data
        </button>

      </div>


      {/* =================================
          STAT CARDS
      ================================== */}

      <div className="analytics-stats-grid">


        {/* TOTAL */}

        <div className="analytics-stat-card">

          <div className="analytics-stat-icon">
            🔍
          </div>

          <div className="analytics-stat-content">

            <span>
              Total Predictions
            </span>

            <strong>
              {totalPredictions}
            </strong>

          </div>

        </div>


        {/* IDENTIFIED */}

        <div className="analytics-stat-card">

          <div className="analytics-stat-icon">
            ✅
          </div>

          <div className="analytics-stat-content">

            <span>
              Identified
            </span>

            <strong>
              {successfulPredictions}
            </strong>

          </div>

        </div>


        {/* UNKNOWN */}

        <div className="analytics-stat-card">

          <div className="analytics-stat-icon">
            ⚠️
          </div>

          <div className="analytics-stat-content">

            <span>
              Unknown / Low Confidence
            </span>

            <strong>
              {unknownPredictions}
            </strong>

          </div>

        </div>


        {/* AVERAGE */}

        <div className="analytics-stat-card">

          <div className="analytics-stat-icon">
            🎯
          </div>

          <div className="analytics-stat-content">

            <span>
              Average Confidence
            </span>

            <strong>
              {averageConfidence.toFixed(2)}%
            </strong>

          </div>

        </div>

      </div>


      {/* =================================
          CONFIDENCE OVERVIEW
      ================================== */}

      <section className="analytics-section">

        <div className="analytics-section-header">

          <div>

            <h2>
              🎯 Confidence Overview
            </h2>

            <p>
              Overall confidence of your
              predictions
            </p>

          </div>


          <span className="analytics-status">
            {getConfidenceStatus()}
          </span>

        </div>


        <div className="analytics-confidence">

          <div className="analytics-confidence-top">

            <span>
              Average Confidence
            </span>

            <strong>
              {averageConfidence.toFixed(2)}%
            </strong>

          </div>


          <div className="analytics-progress">

            <div
              className="analytics-progress-fill"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    averageConfidence
                  )
                )}%`
              }}
            />

          </div>


          <div className="analytics-confidence-footer">

            <span>
              0%
            </span>

            <span>
              Highest:{" "}
              {highestConfidence.toFixed(2)}%
            </span>

            <span>
              100%
            </span>

          </div>

        </div>

      </section>
            {/* =================================
          DISEASE + PLANT ANALYTICS
      ================================== */}

      <div className="analytics-two-column">


        {/* =================================
            DISEASE DISTRIBUTION
        ================================== */}

        <section className="analytics-section">

          <div className="analytics-section-header">

            <div>

              <h2>
                🦠 Disease Distribution
              </h2>

              <p>
                Most frequently detected diseases
              </p>

            </div>

          </div>


          {diseaseStats.length === 0 ? (

            <div className="analytics-no-data">
              No disease data available.
            </div>

          ) : (

            <div className="analytics-bars">

              {diseaseStats.map(
                ([disease, count]) => {

                  const percentage =
                    (count / totalPredictions) *
                    100;


                  return (

                    <div
                      className="analytics-bar-item"
                      key={disease}
                    >

                      <div className="analytics-bar-info">

                        <span>
                          🦠 {disease}
                        </span>

                        <strong>
                          {count}
                        </strong>

                      </div>


                      <div className="analytics-progress">

                        <div
                          className="analytics-progress-fill"
                          style={{
                            width: `${percentage}%`
                          }}
                        />

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </section>


        {/* =================================
            PLANT DISTRIBUTION
        ================================== */}

        <section className="analytics-section">

          <div className="analytics-section-header">

            <div>

              <h2>
                🌱 Plant Distribution
              </h2>

              <p>
                Plants detected in your history
              </p>

            </div>

          </div>


          {plantStats.length === 0 ? (

            <div className="analytics-no-data">
              No plant data available.
            </div>

          ) : (

            <div className="analytics-plant-grid">

              {plantStats.map(
                ([plant, count]) => (

                  <div
                    className="analytics-plant-card"
                    key={plant}
                  >

                    <div className="analytics-plant-icon">
                      🌿
                    </div>


                    <div className="analytics-plant-info">

                      <strong>
                        {plant}
                      </strong>

                      <span>
                        {count}{" "}
                        {count === 1
                          ? "prediction"
                          : "predictions"}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>
            {/* =================================
          RECENT PREDICTIONS
      ================================== */}

      <section className="analytics-section">

        <div className="analytics-section-header">

          <div>

            <h2>
              🕘 Recent Predictions
            </h2>

            <p>
              Latest detection activity
            </p>

          </div>

        </div>


        <div className="analytics-recent-list">

          {history
            .slice(0, 5)
            .map((item, index) => {

              const confidence =
                Number(
                  item?.confidence || 0
                );


              const isUnknown =
                item?.isUnknown === true ||
                item?.is_unknown === true ||
                item?.plant === "Unknown" ||
                item?.disease === "Unknown";


              return (

                <div
                  className="analytics-recent-item"
                  key={
                    item?.id ||
                    item?.timestamp ||
                    index
                  }
                >

                  {/* NUMBER */}

                  <div className="analytics-recent-number">
                    {index + 1}
                  </div>


                  {/* ICON */}

                  <div className="analytics-recent-icon">

                    {isUnknown
                      ? "⚠️"
                      : "🌿"}

                  </div>


                  {/* DETAILS */}

                  <div className="analytics-recent-info">

                    <strong>

                      {item?.plant ||
                        "Unknown"}

                      {" — "}

                      {item?.disease ||
                        "Unknown Leaf"}

                    </strong>


                    <span>

                      🕒{" "}

                      {item?.timestamp
                        ? new Date(
                            item.timestamp
                          ).toLocaleString()
                        : "Recent prediction"}

                    </span>

                  </div>


                  {/* CONFIDENCE */}

                  <div
                    className={
                      isUnknown
                        ? "analytics-recent-confidence low"
                        : "analytics-recent-confidence"
                    }
                  >

                    {confidence.toFixed(2)}%

                  </div>

                </div>

              );

            })}

        </div>

      </section>


      {/* =================================
          ANALYTICS SUMMARY
      ================================== */}

      <section className="analytics-summary">

        <div className="analytics-summary-icon">
          💡
        </div>


        <div className="analytics-summary-content">

          <h2>
            Analytics Summary
          </h2>


          <p>

            You have completed{" "}

            <strong>
              {totalPredictions}
            </strong>{" "}

            {totalPredictions === 1
              ? "prediction"
              : "predictions"}{" "}

            with an average confidence of{" "}

            <strong>
              {averageConfidence.toFixed(2)}%
            </strong>.

            {" "}

            <strong>
              {unknownPredictions}
            </strong>{" "}

            {unknownPredictions === 1
              ? "prediction was"
              : "predictions were"}{" "}

            marked as unknown or
            low-confidence.

          </p>

        </div>

      </section>


    </div>

  );

}
export default Analytics;