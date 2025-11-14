import React from "react";
import { siteSetting } from "../../config/siteSetting";

const Loader: React.FC = () => {
  return (
    <img
      src={siteSetting?.logo}
      alt={siteSetting?.logoAlt}
      className="w-18 h-18 animate-[spin_1.5s_linear_infinite] "
    />
  );
};

export default Loader;
