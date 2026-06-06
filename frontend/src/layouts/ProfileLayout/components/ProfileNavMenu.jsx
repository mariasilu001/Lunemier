import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AppStateContext } from "../../../App";
import { GlobalContext } from "../../../GlobalContext";
import "../styles/profile-nav-menu-styles.css";

function ProfileNavMenu() {
    const { appState } = useContext(AppStateContext);
    const { users } = useContext(GlobalContext);

    const navigate = useNavigate();

    const userId = Number(localStorage.getItem("user_id"));
    if (!users) return null;
    if (!userId) navigate("/login");

    const user = users.find((u) => u._id === userId);

    // Я сам отформатирую дату для тебя.
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU");
    };

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
                {user.createdAt && (
                    <p className="profile-nav-menu-reg-date">
                        С нами с: {formatDate(user.createdAt)}
                    </p>
                )}
            </div>
            <nav className="profile-nav-menu-links-group">
                {navLinks.map((link, index) => (
                    <NavLink
                        key={index}
                        to={link.path}
                        className={({ isActive }) =>
                            isActive
                                ? "profile-nav-menu-link active"
                                : "profile-nav-menu-link"
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
