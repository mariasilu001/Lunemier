import React, { useEffect, useState, useContext } from "react";
import { AppStateContext } from "../../../App";
import "../styles/nav-menu-styles.css";

function NavMenu() {
    const [categories, setCategories] = useState([]);

    // Я забираю контроль над стейтом приложения
    const { appState, setAppState } = useContext(AppStateContext);

    // Если категория не выбрана, значит мы смотрим "Все категории" (null)
    const activeCategoryId = appState.selectedCategoryId || null;

    useEffect(() => {
        // Иду на свой бэкенд за категориями
        fetch("/api/categories")
            .then((res) => res.json())
            .then((data) => {
                if (data.categories) {
                    setCategories(data.categories);
                }
            })
            .catch((err) =>
                console.error("Я не смог загрузить категории:", err),
            );
    }, []);

    // Моя функция жестко устанавливает выбранную категорию в глобальный стейт
    const handleCategoryClick = (categoryId) => {
        setAppState((prev) => ({
            ...prev,
            selectedCategoryId: categoryId,
        }));
    };

    return (
        <nav className="nav-menu-root">
            {/* Статичный пункт "Все категории" */}
            <div
                className={`nav-menu-nav-item-wrapper ${activeCategoryId === null ? "active" : ""}`}
                onClick={() => handleCategoryClick(null)}
            >
                <p className="nav-menu-nav-item-name">Все категории</p>
                <div className="nav-menu-nav-item-separator"></div>
            </div>

            {/* Динамические категории из моей базы */}
            {categories.map((c) => (
                <div
                    className={`nav-menu-nav-item-wrapper ${activeCategoryId === c.categoryId ? "active" : ""}`}
                    key={c.categoryId}
                    onClick={() => handleCategoryClick(c.categoryId)}
                >
                    <p className="nav-menu-nav-item-name">{c.name}</p>
                    <div className="nav-menu-nav-item-separator"></div>
                </div>
            ))}
        </nav>
    );
}

export default NavMenu;
