import React, { useContext, useState } from "react";
import { AppStateContext } from "../../../App";
import { useNavigate } from "react-router-dom";
import ProfileEditModal from "./ProfileEditModal";
import "../styles/profile-info-styles.css";

function ProfileInfo() {
    const { appState, setAppState } = useContext(AppStateContext);
    const navigate = useNavigate();

    // Беру реального юзера или пустую заглушку на время загрузки
    const user = appState?.currentUser || {};

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEditField, setCurrentEditField] = useState(null);

    const handleEditClick = (key, label, value) => {
        setCurrentEditField({ key, label, value });
        setIsModalOpen(true);
    };

    const handleSaveField = async (key, newValue) => {
        try {
            const token = localStorage.getItem("token");
            const body = { [key]: newValue };

            const res = await fetch("/api/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || "ошиба",
                );
            }

            // Обновляем стейт только после подтверждения от сервера
            setAppState((prev) => ({
                ...prev,
                currentUser: {
                    ...prev.currentUser,
                    ...data.user,
                },
            }));
            setIsModalOpen(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleLogout = () => {
        // Жестко вычищаю сессию
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setAppState({
            isAuthenticated: false,
            currentUser: null,
        });
        navigate("/login");
    };

    const editableFields = [
        { key: "firstName", label: "Имя", value: user.firstName || "" },
        { key: "lastName", label: "Фамилия", value: user.lastName || "" },
        { key: "email", label: "Электронная почта", value: user.email || "" },
        {
            key: "phoneNumber",
            label: "Номер телефона",
            value: user.phoneNumber || "",
        },
    ];

    return (
        <section className="profile-info-root">
            <div className="profile-info-card">
                <h2 className="profile-info-header">Личные данные</h2>

                <div className="profile-info-field-group read-only">
                    <div className="profile-info-field-text-data">
                        <p className="profile-info-field-label">Username</p>
                    </div>
                    <p className="profile-info-field-value">{user.username}</p>
                </div>

                <div className="profile-info-separator"></div>

                <div className="profile-info-editable-list">
                    {editableFields.map((field) => (
                        <div
                            className="profile-info-field-group"
                            key={field.key}
                        >
                            <div className="profile-info-field-text-data">
                                <p className="profile-info-field-label">
                                    {field.label}
                                </p>
                                <p className="profile-info-field-value">
                                    {field.value || "Не указано"}
                                </p>
                            </div>
                            <button
                                className="profile-info-edit-btn"
                                onClick={() =>
                                    handleEditClick(
                                        field.key,
                                        field.label,
                                        field.value,
                                    )
                                }
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                                </svg>
                                Изменить
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button className="profile-info-logout-btn" onClick={handleLogout}>
                Выйти из аккаунта
            </button>

            <ProfileEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                field={currentEditField}
                onSave={handleSaveField}
            />
        </section>
    );
}

export default ProfileInfo;
