import { useCallback, useEffect, useState } from "react";
import renderWordCloudTree from "./components/wordCloudTree";
import "./App.css";
const CHART_ID = "tree";
function App() {
  useEffect(() => {
    renderWordCloudTree(CHART_ID);
  }, []);

  return (
    <div className="container">
      <div className="col">
        <div id={CHART_ID} className="tree"></div>
      </div>
      <div className="col align-center">
        <div id={`word-${CHART_ID}`} className="wordcloud" />
      </div>
    </div>
  );
}

export default App;
