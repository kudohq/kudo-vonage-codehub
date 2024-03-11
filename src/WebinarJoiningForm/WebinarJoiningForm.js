import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WebinarJoiningForm.scss";
import Select from "react-select";
import { targetLanguages } from "../constants/targetLanguages";
import { sourceLanguages } from "../constants/sourceLanguages";

export const WebinarJoiningForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    target: [{value: 'HIN', label: 'HINDI'}, {value: 'FRE', label: 'FRENCH'}, {value: 'CHI', label: 'CHINESE'}, {value: 'KOR', label: 'KOREAN'}],
    source: "",
    role: "",
  });
  const options = [
    { value: "Host", label: "Host" },
    { value: "Guest", label: "Guest" },
  ];

  const targetlanguageOptions = targetLanguages.map((language) => ({
    value: language.code,
    label: language.name,
  }));

  const sourcelanguageOptions = sourceLanguages.map((language) => ({
    value: language.code,
    label: language.name,
  }));

  const submitButton = (e) => {
    e.preventDefault();
    navigate("/webinar", {
      state: {
        form: form,
      },
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedOption, field) => {
    setForm({ ...form, [field]: selectedOption.value });
  };

  const handleTargetChange = (e, field) => {
    setForm({ ...form, "target": e });
  }

  return (
    <div className="Formcontainer">
      <Form className="signup-form">
        <Form.Group className="formFields">
          <Form.Control
            className="name-input"
            type="text"
            placeholder="name"
            name="name"
            onChange={handleChange}
          ></Form.Control>
          <Form.Control
            className="email-input"
            type="text"
            placeholder="email"
            name="email"
            onChange={handleChange}
          ></Form.Control>
          <Select
            className="options"
            options={options}
            onChange={(selectedOption) =>
              handleRoleChange(selectedOption, "role")
            }
            required
          />
          {form.role && form.role === "Host" ? (
            <>
              <Select
                className="options"
                value={form.target}
                options={targetlanguageOptions}
                onChange={(selectedOption) =>
                  handleTargetChange(selectedOption)
                }
                isMulti
                isDisabled
              />
              <Select
                className="options"
                options={sourcelanguageOptions}
                onChange={(selectedOption) =>
                  handleRoleChange(selectedOption, "source")
                }
              />
            </>
          ) : null}
          <Button
            className="submit-button"
            value="submit"
            type="submit"
            onClick={submitButton}
          >
            Join Webinar
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};
