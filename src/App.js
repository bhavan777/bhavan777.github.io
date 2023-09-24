import { useCallback, useState } from "react";
import Tree from "./components/Tree";
import "./App.css";
import denseTreeData from "./data.json";
import lightTreeData from "./lightTree.json";
import WordCloud from "./components/WordCloud";

function App() {
  const [source, setSource] = useState("0");
  const [wordsData, setWordsData] = useState([]);
  const [activeWord, setActiveWord] = useState("");
  const onWordClick = useCallback((word) => {
    setActiveWord(word);
  }, []);

  const setWords = (words) => {
    setWordsData(words);
  };
  return (
    <div className="container">
      <select
        className="source-select"
        onChange={(e) => {
          setSource(e.target.value);
        }}>
        <option value={0}>Dense Data</option>
        <option value={1}>Lean Data</option>
      </select>
      <div className="col" id="tree">
        <Tree
          treeData={source === "0" ? denseTreeData : lightTreeData}
          activeWord={activeWord}
          setWords={setWords}
        />
      </div>
      <div className="col">
        <WordCloud wordsData={wordsData} onWordClick={onWordClick} />
      </div>
    </div>
  );
}

export default App;
