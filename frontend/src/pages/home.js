import React, { useState } from "react";
import { Route, Routes, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // Bootstrap Icons

import ManageProfile from "./manageProfile"; // Import ManageProfile component
import HomeContent from "./HomeContent"; // Import HomeContent for the home page

const Home = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true); // State to control sidebar visibility

  // Toggle the sidebar open/close
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar Navigation */}
        <nav
          className={`col-md-3 col-lg-2 d-md-block bg-light sidebar ${
            isSidebarOpen ? "open" : "closed"
          }`}
        >
          <div className="position-sticky">
            {/* Sidebar Toggle Button */}
            <button
              className="btn btn-secondary w-100 my-3"
              onClick={toggleSidebar}
            >
              {/* Show hamburger icon */}
              <i className="bi bi-list"></i>
            </button>

            {/* Sidebar Links */}
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link active" to="/">
                  <i className="bi bi-house-door"></i> {isSidebarOpen && "Home"}
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/manage-profile">
                  <i className="bi bi-person-circle"></i> {isSidebarOpen && "Manage Profile"}
                </Link>
              </li>
              {/* Uncomment or add more routes as needed */}
              {/* <li className="nav-item">
                <Link className="nav-link" to="/my-orders">
                  <i className="bi bi-box-seam"></i> {isSidebarOpen && "My Orders"}
                </Link>
              </li> */}
            </ul>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          {/* Routing logic to display the corresponding component */}
          <Routes>
            {/* This route will display the HomeContent (Search, Filter, and Sort options) */}
            <Route path="/" element={<HomeContent />} />

            {/* This route will display the ManageProfile component */}
            <Route path="/manage-profile" element={<ManageProfile />} />

            {/* Add other routes here as needed */}
            {/* <Route path="/my-orders" element={<MyOrders />} /> */}
          </Routes>
        </main>
      </div>

      <style>{`
        .sidebar {
          transition: all 0.3s;
          height: 100vh;
          position: fixed;
        }

        .sidebar.open {
          width: 250px;
        }

        .sidebar.closed {
          width: 60px;
        }

        .sidebar .nav-link i {
          font-size: 1.2em;
        }

        .sidebar .nav-link {
          display: flex;
          align-items: center;
          padding: 10px;
        }

        .sidebar .nav-link i {
          margin-right: ${isSidebarOpen ? '10px' : '0'};
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
          .sidebar.open {
            display: block;
            width: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
