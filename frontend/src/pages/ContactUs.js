import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ContactUs = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setMessage(""); // Clear message when user starts typing
  };

  const submitQuery = async (event) => {
    event.preventDefault();

    // Validate query input
    if (query.trim().length < 5) {
      setMessage("Query must be at least 5 characters long.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/contact_us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("Your inquiry has been submitted successfully.");
        setTimeout(() => navigate("/"), 3000); // Redirect after success
      } else {
        setMessage(result.message || "Failed to submit your inquiry. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">
        <i className="bi bi-envelope-fill me-2"></i>Contact Us
      </h1>
      <form onSubmit={submitQuery} className="mt-4">
        <div className="mb-4">
          <label htmlFor="query" className="form-label">
            <i className="bi bi-question-circle me-2"></i>Your Query:
          </label>
          <textarea
            id="query"
            className="form-control"
            rows="5"
            value={query}
            onChange={handleQueryChange}
            placeholder="Enter your query or concern here..."
          ></textarea>
        </div>

        <div className="d-flex justify-content-start">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>

      {message && <p className="mt-4 alert alert-info">{message}</p>}
    </div>
  );
};

export default ContactUs;
