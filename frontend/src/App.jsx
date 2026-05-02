import { useEffect, useState, createContext } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { dummyAppState } from "../userStateStructure";

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

export const AppStateContext = createContext(null);

function App() {
    const [appState, setAppState] = useState(dummyAppState);

    useEffect(() => {
        localStorage.setItem("appState", JSON.stringify(appState));
    }, [appState]);

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

                <Route
                    path="/register"
                    element={<RegisterForm /*setAppState={setAppState}*/ />}
                />
                <Route
                    path="/login"
                    element={<LoginForm /*setAppState={setAppState}*/ />}
                />
            </Routes>
        </AppStateContext.Provider>
    );
}

export default App;
