import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WebinarJoiningForm.scss";
import Select from "react-select";
import { sourceLanguages } from "../constants/sourceLanguages.js";
import { predefinedLanguages } from "../constants/PredefinedLanguages.js";
import group from "../Group.png";

export const WebinarJoiningForm = () => {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState("female");

  const [form, setForm] = useState({
    name: "",
    target: predefinedLanguages,
    source: "",
    role: "",
    gender: selectedGender,
  });

  const sourcelanguageOptions = sourceLanguages.map((language) => ({
    value: language.code,
    label: language.name,
  }));

  const submitButton = (e) => {
    e.preventDefault();
    navigate("/webinar", {
      state: {
        form: { ...form, gender: selectedGender },
      },
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedOption, field) => {
    setForm({ ...form, [field]: selectedOption.value });
  };

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
  };

  return (
      <div className="h-[48.7rem] w-[90rem] flex flex-row items-center justify-center bg-dark-200 rounded-3xl">
        <div className="w-1/2 h-full flex items-center justify-center bg-black rounded-tl-3xl rounded-bl-3xl">
          <img src={group} className="h-32 w-48" alt="logo" />
        </div>
        <div className="w-1/2 h-full flex flex-col items-center justify-center rounded-tr-3xl rounded-br-3xl gap-16 bg-[#F5F5F5]">
          <h1 className="text-TextBlue text-center font-roboto font-bold text-3xl">
            Welcome!
          </h1>
          <Form>
            <Form.Group>
              <Form.Control
                className="w-80 rounded-lg border border-gray-500 bg-[#F5F5F5]"
                type="text"
                placeholder="Name"
                name="name"
                onChange={handleChange}
              ></Form.Control>
              <Select
                className="w-80 rounded-lg border border-gray-500 bg-[#F5F5F5]"
                placeholder="Select Source Language..."
                options={sourcelanguageOptions}
                onChange={(selectedOption) =>
                  handleRoleChange(selectedOption, "source")
                }
              />
              <Form.Group className="flex flex-col flex-col-2 justify-content items-center">
                <p className="text-black mb-2">Select your Voice Preference</p>
                <Form.Group>
                  <Form.Check
                    className="GenderSelection"
                    type="radio"
                    inline
                    id="female"
                    label="Female"
                    value="female"
                    checked={selectedGender === "female"}
                    onChange={handleGenderChange}
                  />
                  <Form.Check
                    type="radio"
                    id="male"
                    inline
                    label="Male"
                    value="male"
                    checked={selectedGender === "male"}
                    onChange={handleGenderChange}
                  />
                </Form.Group>
              </Form.Group>
              <Button
                className="text-black rounded rounded-md border-none bg-[#F8C73E] hover:bg-[#F8C73E]"
                value="submit"
                type="submit"
                onClick={submitButton}
              >
                Join webinar
              </Button>
            </Form.Group>
          </Form>
        </div>
      </div>
  );
};
