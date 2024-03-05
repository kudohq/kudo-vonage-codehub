import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WebinarJoiningForm.scss";
import Select from "react-select";

export const WebinarJoiningForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
  });
  const options = [
    { value: "Host", label: "Host" },
    { value: "Guest", label: "Guest" },
  ];
  const submitButton = (e) => {
    e.preventDefault();
    navigate("/webinar", {
      state: {
        role: form.role === "Host",
      },
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedOption) => {
    setForm({ ...form, role: selectedOption.value });
  };

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
          <Select className="options" options={options} onChange={handleRoleChange} />
          <Button
            className="submit-button"
            value="submit"
            type="submit"
            onClick={submitButton}
          >
            Join a Webinar
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};
