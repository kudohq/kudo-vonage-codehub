import React from "react";
import "./LanguageSelector.scss";
import Select from "react-select";

export const LanguageSelector = ({ setSelectedLanguage }) => {
  const options = [
    { value: "HIN", label: "HINDI" },
    { value: "FRE", label: "FRENCH" },
    { value: "CHI", label: "CHINESE" },
    { value: "KOR", label: "KOREAN" },
    { value: "ITA", label: "ITALIAN" },
    { value: "GRK", label: "GREEK" },
    { value: "JPN", label: "JAPANESE" },
  ];

  const handleChange = (selectedOption) => {
    setSelectedLanguage(selectedOption);
  };

  return (
    <div className="languageSelector">
      <div className="m-auto text-light">
        <Select
          placeholder="Change langauge..."
          className="options"
          options={options}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};
