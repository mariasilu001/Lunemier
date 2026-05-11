import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../layouts/MainLayout/components/Header";
import ProductDetails from "./components/ProductDetails";
import ProductReviews from "./components/ProductReviews";
import "./styles/product-details-styles.css";

function ProductPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Я отправляю запрос на свой сервер, чтобы достать всю информацию по товару
        fetch(`/api/products/${productId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.product) {
                    setProduct(data.product);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Я не смог загрузить товар:", err);
                setLoading(false);
            });
    }, [productId]);

    if (loading) {
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
                {/* Передаем реальные данные в дочерние компоненты */}
                <ProductDetails product={product} />
                <ProductReviews product={product} setProduct={setProduct} />
            </main>
        </div>
    );
}

export default ProductPage;