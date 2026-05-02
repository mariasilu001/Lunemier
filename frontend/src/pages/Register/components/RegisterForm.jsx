import React, { useContext } from "react";
import { AppStateContext } from "../../../App";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import handleRegister from "../handlers/handleRegister";
import "../styles/register-form.css";

function RegisterForm(/*{ setAppState }*/) {
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
            handleRegister(data.email, data.password, setAppState);
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
                Уже есть аккаунт?
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
