import React, { useContext } from "react";
import { AppStateContext } from "../../../App";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "../styles/header-styles.css";

function Header() {
    const { appState, setAppState } = useContext(AppStateContext);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    const handleLogout = () => {
        // Я стираю тебя из локального хранилища.
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setAppState({ isAuthenticated: false, currentUser: null });
        navigate("/");
    };

    return (
        <div className="header-root">
            <div className="header-logo-group" onClick={() => navigate("/")}>
                <span className="header-logo-element-1">Lune</span>
                <span className="header-logo-element-2">Mier</span>
            </div>
            <form
                className="header-search-form"
                noValidate
                action=""
                onSubmit={handleSubmit(() =>
                    alert("Поиск пока заглушка, сделаем позже."),
                )}
            >
                <div className="header-search-form-input-group">
                    <label
                        className="header-search-form-label"
                        htmlFor="search-field"
                    >
                        Поисковый запрос
                    </label>
                    <input
                        className="header-search-form-input"
                        type="text"
                        id="search-field"
                        placeholder="Введите ваш запрос"
                        {...register("searchQuery", { required: true })}
                    />
                </div>
                <button
                    className="header-search-form-submit-button"
                    type="submit"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-search"
                        viewBox="0 0 16 16"
                    >
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                    </svg>
                </button>
            </form>

            {/* Я проверяю реальный стейт, а не твои фантазии из заглушек */}
            {appState.isAuthenticated ? (
                <div className="header-right-buttons-group">
                    <button
                        className="header-right-button-light"
                        onClick={() => navigate("/cart")}
                    >
                        Корзина
                    </button>
                    <button
                        className="header-right-button-dark"
                        onClick={() => navigate("/profile/info")}
                    >
                        Личный кабинет
                    </button>
                    <button
                        className="header-right-button-dark"
                        onClick={() => navigate("/admin")}
                    >
                        Админпанель
                    </button>
                    <button
                        className="header-right-button-light"
                        style={{
                            borderLeft: "1px solid var(--color-dark-brown)",
                        }}
                        onClick={handleLogout}
                    >
                        Выйти
                    </button>
                </div>
            ) : (
                <div className="header-right-buttons-group">
                    <button
                        className="header-right-button-light"
                        onClick={() => navigate("/login")}
                    >
                        Войти
                    </button>
                    <button
                        className="header-right-button-dark"
                        onClick={() => navigate("/register")}
                    >
                        Регистрация
                    </button>
                </div>
            )}
        </div>
    );
}

export default Header;
