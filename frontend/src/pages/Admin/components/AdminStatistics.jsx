import React, { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../../../GlobalContext"; // ПОДКЛЮЧАЕМ НАШУ БАЗУ
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import "../styles/admin-statistics-styles.css";

function AdminStatistics() {
    // 1. Достаем все нужные таблицы из нашей базы
    const { orders, users, products, reviews } = useContext(GlobalContext);

    const [stats, setStats] = useState(null);

    // 2. Мощный useEffect, который сам пересчитает стату при любом изменении в базе
    useEffect(() => {
        // Жесткий барьер: ждем, пока IndexedDB выгрузит всё в оперативную память
        if (!orders || !users || !products || !reviews) return;

        try {
            // Агрегация выручки за последние 30 дней
            const last30Days = [];
            const revenueMap = {};

            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString("ru-RU"); // Формат DD.MM.YYYY
                last30Days.push(dateStr);
                revenueMap[dateStr] = 0;
            }

            let totalRev = 0;
            orders.forEach((order) => {
                // ЗАЩИТА: Не считаем отмененные заказы в выручку!
                if (order.status === "Отменен" || order.status === "cancelled")
                    return;

                // Превращаем формат БД "2026-05-30T16:00:00Z" в "30.05.2026"
                const orderDate = new Date(order.created_at).toLocaleDateString(
                    "ru-RU",
                );

                if (revenueMap[orderDate] !== undefined) {
                    const amount = parseFloat(order.total_amount);
                    revenueMap[orderDate] += amount;
                    totalRev += amount;
                }
            });

            const revenueData = last30Days.map((date) => ({
                date: date.substring(0, 5), // Оставляем DD.MM
                Выручка: revenueMap[date],
            }));

            // Агрегация пользователей
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const newUsers = users.filter(
                // Исправлен ключ на created_at
                (user) => new Date(user.created_at) >= thirtyDaysAgo,
            ).length;

            // Агрегация товаров
            let baseCount = 0;
            let customCount = 0;
            let regularCount = 0;

            products.forEach((p) => {
                // Исправлены ключи на is_base и is_custom
                if (p.is_base) baseCount++;
                else if (p.is_custom) customCount++;
                else regularCount++;
            });

            const productDistribution = [
                { name: "Основы", value: baseCount },
                { name: "Кастомные", value: customCount },
                { name: "Обычные", value: regularCount },
            ];

            // Агрегация отзывов
            const totalReviews = reviews.length;
            const avgRating =
                totalReviews > 0
                    ? (
                          reviews.reduce((sum, r) => sum + r.rating, 0) /
                          totalReviews
                      ).toFixed(1)
                    : 0;

            // Сохраняем результат
            setStats({
                revenueData,
                totalRevenue30d: totalRev,
                newUsers30d: newUsers,
                totalUsers: users.length,
                productDistribution,
                totalReviews,
                avgRating,
            });
        } catch (err) {
            console.error("Ошибка при локальной агрегации данных:", err);
        }
    }, [orders, users, products, reviews]); // Массив зависимостей - вся база!

    const COLORS = ["#594545", "#815b5b", "#9e7676"];

    // Если данные еще вычисляются
    if (!stats) {
        return (
            <section className="admin-statistics-root loading">
                <h2 style={{ color: "var(--color-dark-brown)" }}>
                    Анализирую базу данных...
                </h2>
            </section>
        );
    }

    return (
        <section className="admin-statistics-root">
            <div className="admin-statistics-header-row">
                <div>
                    <h2 className="admin-statistics-header">
                        Аналитика и статистика
                    </h2>
                    <p className="admin-statistics-subtitle">
                        Сводка данных бизнеса за 30 дней
                    </p>
                </div>
            </div>

            <div className="admin-stats-cards-grid">
                <div className="admin-stat-card">
                    <p className="stat-card-title">Выручка (30 дней)</p>
                    <p className="stat-card-value">
                        {stats.totalRevenue30d.toLocaleString("ru-RU")} ₽
                    </p>
                </div>
                <div className="admin-stat-card">
                    <p className="stat-card-title">
                        Новые пользователи (30 дней)
                    </p>
                    <p className="stat-card-value">+{stats.newUsers30d}</p>
                    <p className="stat-card-sub">
                        Всего в системе: {stats.totalUsers}
                    </p>
                </div>
                <div className="admin-stat-card">
                    <p className="stat-card-title">Средний рейтинг</p>
                    <p className="stat-card-value">{stats.avgRating} ★</p>
                    <p className="stat-card-sub">
                        На основе {stats.totalReviews} отзывов
                    </p>
                </div>
            </div>

            <div className="admin-charts-grid">
                <div className="admin-chart-container revenue-chart">
                    <h3 className="chart-title">Динамика выручки</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={stats.revenueData}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="colorRevenue"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#594545"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#594545"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    stroke="#594545"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#594545"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `${val}₽`}
                                />
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e0e0e0"
                                />
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: "#fff8ea",
                                        borderRadius: "8px",
                                        border: "1px solid #9e7676",
                                        color: "#594545",
                                    }}
                                    itemStyle={{
                                        color: "#594545",
                                        fontWeight: "bold",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Выручка"
                                    stroke="#594545"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-chart-container pie-chart">
                    <h3 className="chart-title">Распределение товаров</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.productDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stats.productDistribution.map(
                                        (entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        ),
                                    )}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: "#fff8ea",
                                        borderRadius: "8px",
                                        border: "1px solid #9e7676",
                                    }}
                                    itemStyle={{
                                        color: "#594545",
                                        fontWeight: "bold",
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AdminStatistics;
