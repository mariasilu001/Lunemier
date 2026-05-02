import React from "react";
import Header from "../../MainLayout/components/Header";
import AdminNavMenu from "./AdminNavMenu";
import { Outlet } from "react-router-dom";
import "../styles/admin-layout-styles.css";

function AdminLayout() {
    return (
        <>
            <Header />
            <div className="admin-layout-nav-menu-outlet-row-wrapper">
                <AdminNavMenu />

                <div className="admin-layout-root">
                    <Outlet />
                </div>
            </div>
        </>
    );
}

export default AdminLayout;
