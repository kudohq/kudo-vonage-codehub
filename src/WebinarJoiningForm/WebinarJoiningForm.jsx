import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WebinarJoiningForm.scss";
import Select from "react-select";
import { sourceLanguages } from "../constants/sourceLanguages.js";

export const WebinarJoiningForm = () => {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState("female");
  const [selectEventType, setSelectEventType] = useState("meeting");

  const [form, setForm] = useState({
    name: "",
    source: [],
    role: "",
    gender: selectedGender,
    type: selectEventType,
  });
  const options = [{ value: "Host", label: "Host" }];

  const sourcelanguageOptions = sourceLanguages.map((language) => ({
    value: language.code,
    label: language.name,
  }));

  const submitButton = (e) => {
    e.preventDefault();
    if (selectEventType === "meeting") {
      navigate("/meeting", {
        state: {
          form: { ...form, gender: selectedGender, type: selectEventType },
        },
      });
    } else {
      navigate("/webinar", {
        state: {
          form: { ...form, gender: selectedGender, type: selectEventType },
        },
      });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedOption, field) => {
    setForm({ ...form, [field]: selectedOption });
  };

  const handleGenderChange = (event) => {
    if (event.target.id === "female" || event.target.id === "male") {
      setSelectedGender(event.target.value);
    } else {
      setSelectEventType(event.target.value);
    }
  };

  return (
    <>
      <h4 className="Heading">Multilingual Webinar powered by KUDO AI</h4>
      <div className="Formcontainer">
        <Form className="signup-form">
          <Form.Group className="formFields">
            <Form.Control
              className="name-input"
              type="text"
              placeholder="Name"
              name="name"
              onChange={handleChange}
            ></Form.Control>
            <Select
              className="options"
              placeholder="Select Role..."
              options={options}
              onChange={(selectedOption) =>
                handleRoleChange(selectedOption, "role")
              }
              required
            />
            <Form.Group>
                  <p>Event Type</p>
                  <Form.Check
                    className="GenderSelection"
                    type="radio"
                    inline
                    id="meeting"
                    label="Meeting"
                    value="meeting"
                    checked={selectEventType === "meeting"}
                    onChange={handleGenderChange}
                  />
                  <Form.Check
                    type="radio"
                    id="webinar"
                    inline
                    label="Webinar"
                    value="webinar"
                    checked={selectEventType === "webinar"}
                    onChange={handleGenderChange}
                  />
                </Form.Group>
            {selectEventType === "webinar" ? (
              <>
                <Form.Group>
                  <p>Voice Preference</p>
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
                <Select
                  className="options"
                  placeholder="Select Source Language..."
                  options={sourcelanguageOptions}
                  onChange={(selectedOption) =>
                    handleRoleChange(selectedOption, "source")
                  }
                />
              </>
            ) : (
              <Select
                className="options"
                isMulti
                placeholder="Select Source Language..."
                options={sourcelanguageOptions}
                onChange={(selectedOption) =>
                  handleRoleChange(selectedOption, "source")
                }
              />
            )}

            <Button
              className="submit-button"
              value="submit"
              type="submit"
              onClick={submitButton}
            >
              Start Webinar
            </Button>
          </Form.Group>
        </Form>
      </div>
    </>
  );
};
