import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/register'; 
import Header from './components/Header';  // Ensure this path is correct
import Footer from './components/Footer'; 
import Login from './pages/login'; // Ensure this path is correct


    function App() {
      return (
        <Router>
        <Header />
        <main>
          <Routes>
            {/* Define the route for the login page */}
            <Route path="/login" element={<Login />} />
            
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
