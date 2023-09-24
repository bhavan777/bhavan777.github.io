import React, { useState } from "react";

const Node = ({ children, title, id }) => {
  const [show, setShow] = useState(false);
  return (
    <div key={id} style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 0 4px rgba(0,0,0,0.8)",
          padding: "16px 24px",
        }}
      >
        {title}
        {children.length ? (
          <button
            style={{
              backgroundColor: "cyan",
              color: "white",
              border: 0,
              height: "100%",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShow(!show);
            }}
          >
            {show ? "-" : "+"}
          </button>
        ) : null}
      </div>
      {show
        ? children.map((n) => (
            <div key={n.id} style={{ paddingLeft: 36, marginTop: 24 }}>
              <Node {...n} />
            </div>
          ))
        : null}
    </div>
  );
};

export default Node;
