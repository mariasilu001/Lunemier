import React, { useContext, useEffect, useState } from "react";
import { AppStateContext } from "../../App";
import "./product-grid-styles.css";
import ProductCard from "../ProductCard/ProductCard";

function ProductGrid({ isBaseMode = false }) {
    const { appState } = useContext(AppStateContext);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams();

        // Я подчиняю выдачу твоей выбранной категории
        if (appState.selectedCategoryId) {
            params.append("categoryId", appState.selectedCategoryId);
        }

        // Если мы выбираем основу, я говорю бэкенду отдать только базы
        if (isBaseMode) {
            params.append("isBase", "true");
        }

        const url = `/api/products?${params.toString()}`;

        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data.products) {
                    setProducts(data.products);
                }
            })
            .catch((err) => console.error("Ошибка загрузки товаров:", err));
    }, [appState.selectedCategoryId, isBaseMode]);

    return (
        <section className="product-grid-root">
            {products.length > 0 ? (
                products.map((product) => (
                    <ProductCard
                        key={product.productId}
                        product={product}
                        isBaseMode={isBaseMode}
                    />
                ))
            ) : (
                <p
                    style={{
                        color: "var(--color-dark-brown)",
                        gridColumn: "1 / -1",
                    }}
                >
                    Я не нашел товаров по твоему запросу.
                </p>
            )}
        </section>
    );
}

export default ProductGrid;
