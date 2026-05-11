import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/admin-nav-menu-styles.css";

function AdminNavMenu() {
    const navLinks = [
        { path: "/admin/statistics", label: "Статистика" },
        { path: "/admin/users", label: "Управление пользователями" },
        { path: "/admin/products", label: "Каталог и товары" },
        { path: "/admin/prices", label: "Управление ценами" },
        { path: "/admin/dictionaries", label: "Справочники" },
        { path: "/admin/orders", label: "Управление заказами" },
        { path: "/admin/moderation", label: "Модерация контента" },
    ];

    return (
        <aside className="admin-nav-menu-root">
            <div className="admin-nav-menu-header-group">
                <p className="admin-nav-menu-title">Управление</p>
                <p className="admin-nav-menu-subtitle">Системный контроль</p>
            </div>
            <nav className="admin-nav-menu-links-group">
                {navLinks.map((link, index) => (
                    <NavLink
                        key={index}
                        to={link.path}
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-menu-link active"
                                : "admin-nav-menu-link"
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export default AdminNavMenu;
