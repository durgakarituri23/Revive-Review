import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminHome = () => {
    const { user } = useAuth();

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title">Admin Dashboard</h2>
                            <p className="card-text">Welcome, {user?.first_name}!</p>
                            <div className="alert alert-primary">
                                <h4>Platform Overview</h4>
                                <ul className="list-unstyled">
                                    <li>Total Users: Coming soon</li>
                                    <li>Products Pending Review: Coming soon</li>
                                    <li>Active Sellers: Coming soon</li>
                                </ul>
                            </div>
                            <div className="mt-4">
                                <h4>System Status</h4>
                                <p>System metrics and notifications will be displayed here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;