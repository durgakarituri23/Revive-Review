import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/register'; 
import Header from './components/Header';  // Ensure this path is correct
import Footer from './components/Footer'; 
import Login from './pages/login'; // Ensure this path is correct
import ForgotResetPassword from './pages/forgot-password';  // The Forgot Password/Reset component


    function App() {
      return (
        <Router>
        <Header />
        <main>
          <Routes>
            {/* Define the route for the login page */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotResetPassword />} />

            
            {/* Define the route for the register page */}
            <Route path="/register" element={<Register />} />
            
            {/* Add other routes as needed */}
          </Routes>
        </main>
        <Footer />
      </Router>
      );
    }



export default App;
