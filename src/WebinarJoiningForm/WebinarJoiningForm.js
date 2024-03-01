import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WebinarJoiningForm.scss";

export const WebinarJoiningForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    passcode: "",
  });
  const submitButton = (e) => {
    e.preventDefault();
    navigate("/webinar", {
      state: {
        isAdmin: form.passcode === "passcode1",
      },
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
          <Form.Control
            className="email-input"
            type="text"
            placeholder="Enter Admin Password"
            name="passcode"
            onChange={handleChange}
          ></Form.Control>
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
