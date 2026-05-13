import React, { useState, useEffect, useContext } from "react";
import { AppStateContext } from "../../../App";
import "../styles/admin-users-styles.css";

function AdminUsers() {
    const { appState } = useContext(AppStateContext);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Забираю реальные данные из своей базы.
        const token = localStorage.getItem("token");
        fetch("/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.users) setUsers(data.users);
            })
            .catch(err => console.error("Ошибка загрузки пользователей:", err));
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                // Если я разрешил сменить роль на сервере, меняем и здесь.
                setUsers(users.map(user => 
                    user.userId === userId ? { ...user, role: newRole } : user
                ));
            } else {
                const err = await res.json();
                alert(err.message || "Я не позволил изменить роль.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleBan = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/users/${userId}/ban`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                // Мой бэкенд возвращает обновленного юзера с deletedAt
                setUsers(users.map(user => 
                    user.userId === userId ? data.user : user
                ));
            } else {
                const err = await res.json();
                alert(err.message || "Ошибка при изменении статуса блокировки.");
            }
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
            <p className="admin-users-subtitle">Всего пользователей: {users.length}</p>

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
                            <tr key={user.userId} className={user.deletedAt ? "banned-row" : ""}>
                                <td className="font-bold">{user.username}</td>
                                <td>{user.firstName || ""} {user.lastName || ""}</td>
                                <td className="contacts-cell">
                                    <span className="email">{user.email}</span>
                                    <span className="phone">{user.phoneNumber || "Не указан"}</span>
                                </td>
                                <td>{formatDate(user.createdAt)}</td>
                                <td>
                                    <select 
                                        className="admin-users-role-select"
                                        value={user.role || "user"} 
                                        onChange={(e) => handleRoleChange(user.userId, e.target.value)}
                                        // Я запретил менять роль самой себе на бэкенде, защитим и фронт.
                                        disabled={user.username === appState.currentUser?.username} 
                                    >
                                        <option value="user">Customer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <button 
                                        className={`admin-users-ban-btn ${user.deletedAt ? 'unban' : 'ban'}`}
                                        onClick={() => handleToggleBan(user.userId)}
                                        disabled={user.username === appState.currentUser?.username}
                                    >
                                        {user.deletedAt ? "Разблокировать" : "Заблокировать"}
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