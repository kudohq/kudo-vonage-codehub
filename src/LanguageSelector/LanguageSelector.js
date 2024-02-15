import React from "react";
import "./LanguageSelector.scss";
import Select from "react-select";

export const LanguageSelector = ({ setValue }) => {
  const options = [
    { value: "ENGLISH", label: "ENGLISH" },
    { value: "HINDI", label: "HINDI" },
    { value: "GERMAN", label: "GERMAN" },
    { value: "FRENCH", label: "FRENCH" },
    { value: "CHINESE", label: "CHINESE" },
    { value: "URDU", label: "URDU" },
  ];

  const handleChange = (selectedOption) => {
    setValue(selectedOption);
  };

  return (
    <div className="languageSelector">
      <div className="mt-5 m-auto w-50 text-light">
        <Select options={options} onChange={handleChange} />
      </div>
    </div>
  );
};
