import React from "react";
import "./LanguageSelector.scss";
import Select from "react-select";
import { targetLanguages } from "../constants/targetLanguages"
import { sourceLanguages } from "../constants/sourceLanguages"


export const LanguageSelector = ({setValue, isHost}) => {
  const languages = isHost ? sourceLanguages : targetLanguages;
  const options = languages.map(language => ({
    value: language.code,
    label: language.name,
  }));

  const handleChange = (selectedOption) => {
    setValue(selectedOption);
  };

  return (
    <div className="languageSelector">
      <div className="m-auto text-light">
        <Select className="options" options={options} onChange={handleChange} />
      </div>
    </div>
  );
};
