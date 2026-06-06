import React, { useEffect, useState, useContext } from "react";
import { AppStateContext } from "../../../App";
import { GlobalContext } from "../../../GlobalContext";
import "../styles/nav-menu-styles.css";

function NavMenu() {
    //  const [categories, setCategories] = useState([]);

    const { appState, setAppState } = useContext(AppStateContext);
    const { categories, setCategories } = useContext(GlobalContext);

    const activeCategory = categories
        ? categories.find((c) => c.is_active === true)
        : null;
    const activeCategoryId = activeCategory ? activeCategory._id : null;

    // useEffect(() => {
    //     // Иду на свой бэкенд за категориями
    //     fetch("/api/categories")
    //         .then((res) => res.json())
    //         .then((data) => {
    //             if (data.categories) {
    //                 setCategories(data.categories);
    //             }
    //         })
    //         .catch((err) =>
    //             console.error("Я не смог загрузить категории:", err),
    //         );
    // }, []);

    const handleCategoryClick = (id) => {
        setCategories((prev) => {
            return prev.map((c) => {
                if (c._id === id) {
                    return { ...c, is_active: true };
                } else {
                    return { ...c, is_active: false };
                }
            });
        });
    };

    return (
        <nav className="nav-menu-root">
            <div
                className={`nav-menu-nav-item-wrapper ${activeCategoryId === null ? "active" : ""}`}
                onClick={() => handleCategoryClick(null)}
            >
                <p className="nav-menu-nav-item-name">Все категории</p>
                <div className="nav-menu-nav-item-separator"></div>
            </div>

            {categories && categories.map((c) => (
                <div
                    className={`nav-menu-nav-item-wrapper ${activeCategoryId === c._id ? "active" : ""}`}
                    key={c._id}
                    onClick={() => handleCategoryClick(c._id)}
                >
                    <p className="nav-menu-nav-item-name">{c.name}</p>
                    <div className="nav-menu-nav-item-separator"></div>
                </div>
            ))}
        </nav>
    );
}

export default NavMenu;
