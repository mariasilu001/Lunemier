import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { GlobalContext } from "../../GlobalContext";
import Header from "../../layouts/MainLayout/components/Header";
import ProductDetails from "./components/ProductDetails";
import ProductReviews from "./components/ProductReviews";
import "./styles/product-details-styles.css";

function ProductPage() {
    const { productId } = useParams();
    const { products } = useContext(GlobalContext);

    // Жесткий барьер. Ждем базу данных. (Заменяет твой стейт loading)
    if (!products) {
        return (
            <div className="product-page-root">
                <Header />
                <main className="product-page-main">
                    <p style={{ fontSize: "20px", color: "var(--color-dark-brown)" }}>
                        Подтягиваю данные. Жди.
                    </p>
                </main>
            </div>
        );
    }

    // Вычисляем на лету. Без useState и useEffect.
    const product = products.find((p) => p._id === Number(productId));

    // Если база загрузилась, но товара нет
    if (!product) {
        return (
            <div className="product-page-root">
                <Header />
                <main className="product-page-main">
                    <p style={{ fontSize: "20px", color: "var(--color-dark-brown)" }}>
                        Этого товара не существует в моей базе.
                    </p>
                </main>
            </div>
        );
    }

    return (
        <div className="product-page-root">
            <Header />
            <main className="product-page-main">
                <ProductDetails product={product} />
                <ProductReviews product={product} />
            </main>
        </div>
    );
}

export default ProductPage;