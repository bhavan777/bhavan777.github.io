import React from "react";
import WordCloudLib from "react-d3-cloud";
import { scaleOrdinal, schemeDark2 } from "d3";

const schemeCategory10ScaleOrdinal = scaleOrdinal(schemeDark2);
const WordCloud = ({ wordsData, onWordClick }) => {
  return (
    <div className="word-cloud">
      <WordCloudLib
        data={wordsData}
        font="Impact"
        height={window.innerHeight}
        width={window.innerWidth / 2}
        rotate={0}
        padding={0}
        spiral={"rectangular"}
        fontSize={(word) => word.value * 24}
        onWordClick={(_, word) => {
          onWordClick(word.text);
        }}
        fill={(d, i) => schemeCategory10ScaleOrdinal(i)}
      />
    </div>
  );
};
export default WordCloud;
