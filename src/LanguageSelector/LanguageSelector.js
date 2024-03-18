import React from "react";
import "./LanguageSelector.scss";
import Select from "react-select";
import { predefinedLanguages } from "../constants/PredefinedLanguages";

export const LanguageSelector = ({ setSelectedLanguage }) => {

  const handleChange = (selectedOption) => {
    setSelectedLanguage(selectedOption);
  };

  return (
    <div className="languageSelector">
      <div className="m-auto text-light">
        <Select
          placeholder="Change langauge..."
          className="options"
          options={predefinedLanguages}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};
