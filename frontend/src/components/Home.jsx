// src/components/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light text-center px-3">
      <div>
        <h1 className="mb-4">Welcome to RMS</h1>
        <p className="lead mb-4">Please select your role to continue:</p>

        <div className="d-grid gap-3" style={{ maxWidth: "300px", margin: "auto" }}>
          <Link to="/cashier-login" className="btn btn-outline-primary btn-lg">
            Cashier Login
          </Link>
          {/* <Link to="/kitchen-login" className="btn btn-outline-dark btn-lg">
            Kitchen Login
          </Link> */}
          <Link to="/admin-login" className="btn btn-outline-success btn-lg">
            Admin Login
          </Link>
        </div>

        <hr className="my-4" />

        <div className="mt-3">
          <p className="text-muted">
            New user? Sign up as:
          </p>
          <div className="d-grid gap-2" style={{ maxWidth: "300px", margin: "auto" }}>
            <Link to="/signup?role=cashier" className="btn btn-primary btn-sm">
              Sign Up as Cashier
            </Link>
            {/* <Link to="/signup?role=kitchen" className="btn btn-dark btn-sm">
              Sign Up as Kitchen Staff
            </Link> */}
            <Link to="/signup?role=admin" className="btn btn-success btn-sm">
              Sign Up as Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;