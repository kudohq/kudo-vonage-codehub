import React from "react";
import "./LanguageSelector.scss";
import Select from "react-select";

export const LanguageSelector = ({ setSelectedLanguage, predefinedLanguages }) => {

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
