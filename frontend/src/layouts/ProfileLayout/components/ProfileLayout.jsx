import React from "react";
import Header from "../../MainLayout/components/Header";
import ProfileNavMenu from "./ProfileNavMenu";
import { Outlet } from "react-router-dom";
import "../styles/profile-layout-styles.css";

function ProfileLayout() {
    return (
        <>
            <Header />
            <div className="profile-layout-nav-menu-outlet-row-wrapper">
                <ProfileNavMenu />
                
                <div className="profile-layout-root">
                    <Outlet />
                </div>
            </div>
        </>
    );
}

export default ProfileLayout;