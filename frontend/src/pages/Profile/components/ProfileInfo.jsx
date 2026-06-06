import React, { useContext, useState } from "react";
import { AppStateContext } from "../../../App";
import { GlobalContext } from "../../../GlobalContext";
import { useNavigate } from "react-router-dom";
import ProfileEditModal from "./ProfileEditModal";
import "../styles/profile-info-styles.css";

function ProfileInfo() {
    const { appState, setAppState } = useContext(AppStateContext);
    const { users, setUsers } = useContext(GlobalContext);
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEditField, setCurrentEditField] = useState(null);

    const userId = Number(localStorage.getItem("user_id"));

   
    if (!users || !setUsers) return null;
    if (!userId) {
        navigate("/login");
        return null;
    }

    const user = users.find((u) => u._id === userId);
    if (!user) return null;

    const handleEditClick = (key, label, value) => {
        setCurrentEditField({ key, label, value });
        setIsModalOpen(true);
    };

    // 3. НОВЫЙ ЛОКАЛЬНЫЙ ОБРАБОТЧИК СОХРАНЕНИЯ
    const handleSaveField = (key, newValue) => {
        try {
            // Обновляем глобальную базу данных (которая потом запишется в IndexedDB)
            setUsers((prevUsers) => {
                return prevUsers.map((u) => {
                    // Ищем нашего юзера
                    if (u._id === userId) {
                        // Возвращаем копию юзера с измененным полем
                        return { ...u, [key]: newValue };
                    }
                    // Остальных юзеров не трогаем
                    return u;
                });
            });

            // Обновляем текущую сессию в AppState, чтобы имя поменялось в шапке сайта
            setAppState((prev) => ({
                ...prev,
                currentUser: {
                    ...prev.currentUser,
                    [key]: newValue,
                },
            }));

            // Закрываем модалку
            setIsModalOpen(false);
        } catch (err) {
            console.error("Ошибка при обновлении профиля:", err);
            alert("Я не смог обновить профиль. Проверь консоль.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user_id");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setAppState({
            isAuthenticated: false,
            currentUser: null,
        });
        navigate("/login");
    };

    // 4. ИСПРАВЛЕННЫЕ КЛЮЧИ (как в базе данных users.js)
    const editableFields = [
        { key: "first_name", label: "Имя", value: user.first_name || "" },
        { key: "last_name", label: "Фамилия", value: user.last_name || "" },
        { key: "email", label: "Электронная почта", value: user.email || "" },
        {
            key: "phone_number",
            label: "Номер телефона",
            value: user.phone_number || "",
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
