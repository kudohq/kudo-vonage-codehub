import React from "react";
import "./LanguageSelector.scss";
import Select from "react-select";

export const LanguageSelector = ({setSelectedLanguage}) => {

  const options = [{value: 'HIN', label: 'HINDI'}, {value: 'FRE', label: 'FRENCH'}, {value: 'CHI', label: 'CHINESE'}, {value: 'KOR', label: 'KOREAN'}];

  const handleChange = (selectedOption) => {
    setSelectedLanguage(selectedOption);
  };

  return (
    <div className="languageSelector">
      <div className="m-auto text-light">
        <Select className="options" options={options} onChange={handleChange} />
      </div>
    </div>
  );
};
