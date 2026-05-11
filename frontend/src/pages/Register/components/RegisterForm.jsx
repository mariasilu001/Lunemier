import React, { useContext } from "react";
import { AppStateContext } from "../../../App";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "../styles/register-form.css";

function RegisterForm() {
    const { setAppState } = useContext(AppStateContext);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    const onFormSubmit = async (data) => {
        try {
            // Я сам генерирую username, чтобы база не выкинула ошибку.
            const generatedUsername =
                data.email.split("@")[0] + Math.floor(Math.random() * 10000);

            // Шаг 1: Регистрация пешки в моей системе
            const regResponse = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: generatedUsername,
                    email: data.email,
                    password: data.password,
                }),
            });

            const regResult = await regResponse.json();

            if (!regResponse.ok) {
                throw new Error(
                    regResult.message ||
                        "Я не смог тебя зарегистрировать. Что-то пошло не так.",
                );
            }

            // Шаг 2: Моментальный логин. Я не заставлю тебя вводить это дважды.
            const loginResponse = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
            });

            const loginResult = await loginResponse.json();

            if (!loginResponse.ok) {
                throw new Error(
                    loginResult.message ||
                        "Ошибка автоматического входа. Мой бэкенд недоволен.",
                );
            }

            // Захватываем контроль над сессией.
            localStorage.setItem("token", loginResult.token);
            localStorage.setItem("role", loginResult.user.role);

            setAppState((prev) => ({
                ...prev,
                user: loginResult.user,
                isAuthenticated: true,
            }));

            // Пошла на главную страницу, быстро.
            navigate("/");
        } catch (err) {
            setError("root", { message: err.message });
        }
    };

    return (
        <form
            className="register-form-root"
            noValidate
            action=""
            method="post"
            onSubmit={handleSubmit(onFormSubmit)}
        >
            <p className="register-form-header">Регистрация</p>
            <div className="register-form-email-input-group">
                <label
                    className="register-form-email-input-group-label"
                    htmlFor="email-input"
                >
                    Электронная почта
                </label>
                <input
                    className="register-form-email-input-group-input"
                    type="email"
                    id="email-input"
                    aria-describedby="email-error"
                    aria-invalid="true"
                    {...register("email", {
                        required: "Поле обязательно для заполнения",
                    })}
                />
                {errors.email && (
                    <span
                        className="register-form-email-input-group-error-message"
                        id="email-error"
                    >
                        {errors.email.message}
                    </span>
                )}
            </div>

            <div className="register-form-password-input-group">
                <label
                    className="register-form-password-input-group-label"
                    htmlFor="password-input"
                >
                    Пароль
                </label>
                <input
                    className="register-form-password-input-group-input"
                    type="password"
                    id="password-input"
                    aria-describedby="password-error"
                    aria-invalid="true"
                    {...register("password", {
                        required: "Поле обязательно для заполнения",
                    })}
                />
                {errors.password && (
                    <span
                        className="register-form-password-input-group-error-message"
                        id="password-error"
                    >
                        {errors.password.message}
                    </span>
                )}
            </div>
            <button className="register-form-submit-button" type="submit">
                Зарегистрироваться
            </button>
            {errors.root && (
                <span
                    className="register-form-password-input-group-error-message"
                    id="password-error"
                >
                    {errors.root.message}
                </span>
            )}
            <p className="register-form-login-link">
                Уже есть аккаунта?
                <span
                    className="register-form-login-link-accent"
                    onClick={() => {
                        navigate("/login");
                    }}
                >
                    Войти.
                </span>
            </p>
        </form>
    );
}

export default RegisterForm;
