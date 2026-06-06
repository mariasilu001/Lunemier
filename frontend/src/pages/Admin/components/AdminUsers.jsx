import React, { useContext } from "react";
import { AppStateContext } from "../../../App";
import { GlobalContext } from "../../../GlobalContext"; // Подключаем нашу базу
import "../styles/admin-users-styles.css";

function AdminUsers() {
    const { appState } = useContext(AppStateContext);
    const { users, setUsers } = useContext(GlobalContext); // Достаем пользователей из памяти

    // Жесткий барьер загрузки
    if (!users) return null;

    // Определяем ID текущего админа, чтобы не дать ему забанить самого себя
    const currentUserId = Number(localStorage.getItem("user_id"));

    // === ЛОКАЛЬНАЯ СМЕНА РОЛИ ===
    const handleRoleChange = (userId, newRole) => {
        if (userId === currentUserId) {
            alert("Ты не можешь изменить роль самой себе. Дисциплина.");
            return;
        }
        try {
            // Перебираем юзеров и меняем роль нужному
            setUsers((prev) =>
                prev.map((user) =>
                    user._id === userId ? { ...user, role: newRole } : user,
                ),
            );
        } catch (error) {
            console.error(error);
        }
    };

    // === ЛОКАЛЬНАЯ БЛОКИРОВКА / РАЗБЛОКИРОВКА ===
    const handleToggleBan = (userId) => {
        if (userId === currentUserId) {
            alert("Ты не можешь заблокировать саму себя.");
            return;
        }
        try {
            setUsers((prev) =>
                prev.map((user) => {
                    if (user._id === userId) {
                        // Если deleted_at уже есть (забанен) -> ставим null (разбаниваем)
                        // Если deleted_at нет -> ставим текущую дату (баним)
                        const newDeletedAt = user.deleted_at
                            ? null
                            : new Date().toISOString();
                        return { ...user, deleted_at: newDeletedAt };
                    }
                    return user;
                }),
            );
        } catch (error) {
            console.error(error);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("ru-RU");
    };

    return (
        <section className="admin-users-root">
            <h2 className="admin-users-header">Управление пользователями</h2>
            <p className="admin-users-subtitle">
                Всего пользователей: {users.length}
            </p>

            <div className="admin-users-table-wrapper">
                <table className="admin-users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Имя и Фамилия</th>
                            <th>Контакты</th>
                            <th>Регистрация</th>
                            <th>Роль</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user._id}
                                className={user.deleted_at ? "banned-row" : ""}
                            >
                                <td className="font-bold">{user.username}</td>
                                <td>
                                    {user.first_name || ""}{" "}
                                    {user.last_name || ""}
                                </td>
                                <td className="contacts-cell">
                                    <span className="email">{user.email}</span>
                                    <span className="phone">
                                        {user.phone_number || "Не указан"}
                                    </span>
                                </td>
                                <td>{formatDate(user.created_at)}</td>
                                <td>
                                    <select
                                        className="admin-users-role-select"
                                        value={user.role}
                                        onChange={(e) =>
                                            handleRoleChange(
                                                user._id,
                                                e.target.value,
                                            )
                                        }
                                        disabled={user._id === currentUserId}
                                    >
                                        <option value="customer">
                                            Customer
                                        </option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <button
                                        className={`admin-users-ban-btn ${user.deleted_at ? "unban" : "ban"}`}
                                        onClick={() =>
                                            handleToggleBan(user._id)
                                        }
                                        disabled={user._id === currentUserId}
                                    >
                                        {user.deleted_at
                                            ? "Разблокировать"
                                            : "Заблокировать"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default AdminUsers;
