import { useEffect, useState, createContext } from "react";
import { Routes, Route } from "react-router-dom";

import RegisterForm from "./pages/Register/components/RegisterForm";
import LoginForm from "./pages/Login/components/LoginForm";
import MainLayout from "./layouts/MainLayout/components/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import SelectBase from "./pages/Customizator/components/SelectBase";
import CustomizatorRedactor from "./pages/Customizator/components/CustomizatorRedactor";
import ProfileLayout from "./layouts/ProfileLayout/components/ProfileLayout";
import ProfileInfo from "./pages/Profile/components/ProfileInfo";
import ProfileOrders from "./pages/Profile/components/ProfileOrders";
import ProfileReviews from "./pages/Profile/components/ProfileReviews";
import ProfileCustoms from "./pages/Profile/components/ProfileCustoms";
import AdminLayout from "./layouts/AdminLayout/components/AdminLayout";
import AdminUsers from "./pages/Admin/components/AdminUsers";
import AdminProducts from "./pages/Admin/components/AdminProducts";
import AdminPrices from "./pages/Admin/components/AdminPrices";
import AdminDictionaries from "./pages/Admin/components/AdminDictionaries";
import AdminOrders from "./pages/Admin/components/AdminOrders";
import AdminModeration from "./pages/Admin/components/AdminModeration";
import ProductPage from "./pages/Product/ProductPage";
import CartPage from "./pages/Cart/CartPage";
import AdminStatistics from "./pages/Admin/components/AdminStatistics";

export const AppStateContext = createContext(null);

function App() {
    // Я задаю жесткую структуру стейта. Только правда, никаких заглушек.
    const [appState, setAppState] = useState({
        isAuthenticated: !!localStorage.getItem("token"),
        currentUser: null,
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // Если у тебя есть токен, я иду на сервер и забираю твои данные.
            fetch("/api/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => {
                    if (!res.ok) {
                        // Если токен протух - я безжалостно вышвыриваю тебя из сессии.
                        localStorage.removeItem("token");
                        localStorage.removeItem("role");
                        setAppState({
                            isAuthenticated: false,
                            currentUser: null,
                        });
                        throw new Error("Токен недействителен.");
                    }
                    return res.json();
                })
                .then((data) => {
                    setAppState({
                        isAuthenticated: true,
                        currentUser: data.user,
                    });
                })
                .catch((err) => console.error("Ошибка проверки сессии:", err));
        }
    }, []);

    return (
        <AppStateContext.Provider value={{ appState, setAppState }}>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route
                        path="/customizator/select-base"
                        element={<SelectBase />}
                    />
                </Route>
                <Route
                    path="/customizator/redactor"
                    element={<CustomizatorRedactor />}
                />
                <Route path="/p/:productId" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />

                <Route path="/profile" element={<ProfileLayout />}>
                    <Route index path="info" element={<ProfileInfo />} />
                    <Route path="orders" element={<ProfileOrders />} />
                    <Route path="reviews" element={<ProfileReviews />} />
                    <Route path="customs" element={<ProfileCustoms />} />
                </Route>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminStatistics />} />
                    <Route path="statistics" element={<AdminStatistics />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="prices" element={<AdminPrices />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="moderation" element={<AdminModeration />} />
                    <Route
                        path="dictionaries"
                        element={<AdminDictionaries />}
                    />
                </Route>

                <Route path="/register" element={<RegisterForm />} />
                <Route path="/login" element={<LoginForm />} />
            </Routes>
        </AppStateContext.Provider>
    );
}

export default App;
