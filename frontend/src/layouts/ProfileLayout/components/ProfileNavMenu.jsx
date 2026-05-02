import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AppStateContext } from "../../../App";
import "../styles/profile-nav-menu-styles.css";

function ProfileNavMenu() {
    const { appState } = useContext(AppStateContext);
    
    const user = appState?.currentUser?.username 
        ? appState.currentUser 
        : { username: "Лилия", registrationDate: "18.04.2026" };

    const navLinks = [
        { path: "/profile/info", label: "Общая информация" },
        { path: "/profile/orders", label: "Заказы" },
        { path: "/profile/reviews", label: "Мои отзывы" },
        { path: "/profile/customs", label: "Мои кастомные товары" },
    ];

    return (
        <aside className="profile-nav-menu-root">
            <div className="profile-nav-menu-user-info-group">
                <p className="profile-nav-menu-username">{user.username}</p>
                <p className="profile-nav-menu-reg-date">С нами с: {user.registrationDate}</p>
            </div>
            <nav className="profile-nav-menu-links-group">
                {navLinks.map((link, index) => (
                    <NavLink
                        key={index}
                        to={link.path}
                        className={({ isActive }) =>
                            isActive ? "profile-nav-menu-link active" : "profile-nav-menu-link"
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export default ProfileNavMenu;