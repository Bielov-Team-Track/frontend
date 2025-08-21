import React from "react";

function Loader({ ...props }: any) {
  return (
    <div
      {...props}
      className={`grid place-items-center z-50 ${props.className}`}
    >
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
}

export default Loader;
