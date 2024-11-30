import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SellerHome = () => {
    const { user } = useAuth();

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title">Seller Dashboard</h2>
                            <p className="card-text">Welcome, {user?.first_name}!</p>
                            <div className="alert alert-info">
                                <h4>Quick Statistics</h4>
                                <ul className="list-unstyled">
                                    <li>Total Products: Coming soon</li>
                                    <li>Products Pending Approval: Coming soon</li>
                                    <li>Total Sales: Coming soon</li>
                                </ul>
                            </div>
                            <div className="mt-4">
                                <h4>Recent Activity</h4>
                                <p>Your recent activity will be displayed here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerHome;