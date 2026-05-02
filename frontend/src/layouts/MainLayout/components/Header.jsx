import React, { useContext } from "react";
import { AppStateContext } from "../../../App";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "../styles/header-styles.css";

function Header() {
    const { appState } = useContext(AppStateContext);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

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
                onSubmit={handleSubmit(() => alert("Поиск работает!"))}
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

            <a href="/admin">Админпанель</a>

            {appState.currentUser.isAuthorized === true ? (
                <div className="header-right-buttons-group">
                    <button
                        className="header-right-button-light"
                        onClick={() => navigate("/cart")}
                    >
                        Корзина
                    </button>
                    <button
                        className="header-right-button-dark"
                        onClick={() => navigate("/profile")}
                    >
                        Личный кабинет
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
                        Зарегистрироваться
                    </button>
                </div>
            )}
        </div>
    );
}

export default Header;
