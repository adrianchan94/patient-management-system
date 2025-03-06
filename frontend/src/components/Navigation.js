import React from 'react';

function Navigation() {
  return (
    <div className="navigation">
      <div className="logo">
        <h2>Prenetics</h2>
      </div>
      <div className="nav-items">
        <div className="nav-item active">Patient Management</div>
        <div className="nav-item">Result Upload</div>
        <div className="nav-item">Kit Activation</div>
        <div className="nav-item logout">Log Out</div>
      </div>
    </div>
  );
}

export default Navigation; 