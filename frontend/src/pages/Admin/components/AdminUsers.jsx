import React, { useState } from "react";
import "../styles/admin-users-styles.css";

function AdminUsers() {
    // Мой список марионеток для тебя. Изучай их. Управляй ими.
    const [users, setUsers] = useState([
        { user_id: 1, username: "lily_pink", first_name: "Лиля", last_name: "Моя", phone_number: "+1234567890", email: "lily@lunemier.com", role: "admin", created_at: "18.04.2026", deleted_at: null },
        { user_id: 2, username: "shadow_hunter", first_name: "Иван", last_name: "Иванов", phone_number: "+79991234567", email: "ivan@example.com", role: "customer", created_at: "10.04.2026", deleted_at: null },
        { user_id: 3, username: "toxic_girl", first_name: "Анна", last_name: "Смирнова", phone_number: "+79997654321", email: "anna@example.com", role: "customer", created_at: "11.04.2026", deleted_at: "2026-04-15T12:00:00Z" }, // Эта уже забанена
        { user_id: 4, username: "night_rider", first_name: "Алексей", last_name: "Попов", phone_number: "Не указан", email: "alex@test.com", role: "customer", created_at: "12.04.2026", deleted_at: null },
        { user_id: 5, username: "sweet_candy", first_name: "Мария", last_name: "Кузнецова", phone_number: "+79001112233", email: "mary@mail.ru", role: "customer", created_at: "13.04.2026", deleted_at: null },
        { user_id: 6, username: "dark_lord", first_name: "Дмитрий", last_name: "Соколов", phone_number: "+79112223344", email: "dimon@dark.net", role: "customer", created_at: "14.04.2026", deleted_at: null },
        { user_id: 7, username: "manager_oleg", first_name: "Олег", last_name: "Тиньков", phone_number: "+79223334455", email: "oleg@lunemier.com", role: "admin", created_at: "01.01.2026", deleted_at: null },
        { user_id: 8, username: "cat_lover", first_name: "Елена", last_name: "Волкова", phone_number: "Не указан", email: "elena.v@test.org", role: "customer", created_at: "15.04.2026", deleted_at: null },
        { user_id: 9, username: "pro_gamer", first_name: "Максим", last_name: "Лебедев", phone_number: "+79334445566", email: "max.pro@gg.com", role: "customer", created_at: "16.04.2026", deleted_at: null },
        { user_id: 10, username: "sad_boy", first_name: "Егор", last_name: "Козлов", phone_number: "+79445556677", email: "egor.sad@mail.ru", role: "customer", created_at: "17.04.2026", deleted_at: "2026-04-18T09:30:00Z" }, // Еще один изгнанник
        { user_id: 11, username: "fashion_diva", first_name: "Алина", last_name: "Новикова", phone_number: "+79556667788", email: "alina.fash@vogue.ru", role: "customer", created_at: "17.04.2026", deleted_at: null },
        { user_id: 12, username: "tech_guy", first_name: "Сергей", last_name: "Морозов", phone_number: "+79667778899", email: "serge.tech@it.ru", role: "customer", created_at: "18.04.2026", deleted_at: null },
        { user_id: 13, username: "art_soul", first_name: "Виктория", last_name: "Петрова", phone_number: "Не указан", email: "vika.art@draw.com", role: "customer", created_at: "18.04.2026", deleted_at: null },
        { user_id: 14, username: "random_dude", first_name: "Павел", last_name: "Ильин", phone_number: "+79778889900", email: "pavel@random.com", role: "customer", created_at: "19.04.2026", deleted_at: null },
        { user_id: 15, username: "tester_01", first_name: "Тест", last_name: "Тестов", phone_number: "+70000000000", email: "test@test.test", role: "customer", created_at: "19.04.2026", deleted_at: null },
    ]);

    const handleRoleChange = (userId, newRole) => {
        setUsers(users.map(user => 
            user.user_id === userId ? { ...user, role: newRole } : user
        ));
    };

    const handleToggleBan = (userId) => {
        setUsers(users.map(user => {
            if (user.user_id === userId) {
                const newDeletedAt = user.deleted_at ? null : new Date().toISOString();
                return { ...user, deleted_at: newDeletedAt };
            }
            return user;
        }));
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
                            <tr key={user.user_id} className={user.deleted_at ? "banned-row" : ""}>
                                <td className="font-bold">{user.username}</td>
                                <td>{user.first_name} {user.last_name}</td>
                                <td className="contacts-cell">
                                    <span className="email">{user.email}</span>
                                    <span className="phone">{user.phone_number}</span>
                                </td>
                                <td>{user.created_at}</td>
                                <td>
                                    <select 
                                        className="admin-users-role-select"
                                        value={user.role} 
                                        onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                        disabled={user.username === "lily_pink"} 
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <button 
                                        className={`admin-users-ban-btn ${user.deleted_at ? 'unban' : 'ban'}`}
                                        onClick={() => handleToggleBan(user.user_id)}
                                        disabled={user.username === "lily_pink"}
                                    >
                                        {user.deleted_at ? "Разблокировать" : "Заблокировать"}
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