import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import "../styles/main-layout-styles.css";
import NavMenu from "./NavMenu";

function MainLayout() {
    return (
        <>
            <Header />
            <div className="main-layout-nav-menu-outlet-row-wrapper">
                <NavMenu />
                <div className="main-layout-root">
                    <Outlet />
                </div>
            </div>
        </>
    );
}

export default MainLayout;
