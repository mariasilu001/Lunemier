import React, { useContext } from "react";
import { AppStateContext } from "../../../App";
import { GlobalContext } from "../../../GlobalContext";
import { set, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "../styles/register-form.css";

function LoginForm() {
    const { setAppState } = useContext(AppStateContext);
    const { users } = useContext(GlobalContext);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    // const onFormSubmit = async (data) => {
    //     try {
    //         // Я отправляю твои данные на свой сервер.
    //         const response = await fetch("/api/login", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 email: data.email,
    //                 password: data.password,
    //             }),
    //         });

    //         const result = await response.json();

    //         if (!response.ok) {
    //             // Если ты ошиблась — я скажу тебе об этом жестко.
    //             throw new Error(result.message || "Ошибка авторизации. Смотри, что вводишь.");
    //         }

    //         // Я сказал, что запишу токен и роль в сторадж — я это делаю.
    //         localStorage.setItem("token", result.token);
    //         localStorage.setItem("role", result.user.role);

    //         setAppState((prev) => ({
    //             ...prev,
    //             user: result.user,
    //             isAuthenticated: true,
    //         }));

    //         // Отправляю на главную.
    //         navigate("/");
    //     } catch (err) {
    //         setError("root", { message: err.message });
    //     }
    // };

    const onFormSubmit = (data) => {
        const existingUser = users.find((u) => u.email === data.email);

        if (!existingUser) {
            setError("root", {
                message: "Пользователя с таким email не существует",
            });
            return;
        }

        if (existingUser.password_hash !== data.password) {
            setError("root", {
                message: "Неверный пароль",
            });
            return;
        }

        const fakeJwtToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.OiJIUzI1NiIsInR5cCOiJIUzI1NiIsInR5cC" +
            existingUser._id;

        localStorage.setItem("token", fakeJwtToken);
        localStorage.setItem("user_id", existingUser._id);
        localStorage.setItem("role", existingUser.role);

        setAppState((prev) => {
            return {
                ...prev,
                isAuthenticated: true,
                currentUser: existingUser,
            };
        });

        navigate("/");
    };

    return (
        <form
            className="register-form-root"
            noValidate
            action=""
            method="post"
            onSubmit={handleSubmit(onFormSubmit)}
        >
            <p className="register-form-header">Вход</p>
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
                Войти
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
                Еще нет аккаунта?
                <span
                    className="register-form-login-link-accent"
                    onClick={() => {
                        navigate("/register");
                    }}
                >
                    Зарегистрироваться.
                </span>
            </p>
        </form>
    );
}

export default LoginForm;
