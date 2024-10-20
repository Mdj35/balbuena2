// Layout.js
import React from 'react';

const Layout = ({ children }) => {
    return (
        <div>
            <div className='d-flex justify-content-center py-2 shadow-sm'>
                Book Management System
            </div>
            <div>{children}</div>
        </div>
    );
};

export default Layout;
