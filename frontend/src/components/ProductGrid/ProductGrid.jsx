import React, { useContext } from "react";
import { AppStateContext } from "../../App";
import { GlobalContext } from "../../GlobalContext";
import "./product-grid-styles.css";
import ProductCard from "../ProductCard/ProductCard";

function ProductGrid({ isBaseMode = false }) {
    const { appState } = useContext(AppStateContext);
    const { products, categories } = useContext(GlobalContext);

    if (!products || !categories) {
        return null;
    }

    const activeCategory = categories.find((c) => c.is_active === true);
    const activeCategoryId = activeCategory ? activeCategory._id : null;

    const filteredProducts = products.filter((p) => {
        const matchesCategory = activeCategoryId ? p.category_id === activeCategoryId : true;

        const matchesBaseMode = isBaseMode ? p.is_base === true : true;

        const matchesCustom = p.is_custom === false

        return matchesCategory && matchesBaseMode && matchesCustom;
    });

    return (
        <section className="product-grid-root">
            {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                    <ProductCard
                        key={product._id}
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
                    Пока нет товаров этой категории
                </p>
            )}
        </section>
    );
}

export default ProductGrid;
