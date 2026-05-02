import React from "react";
import "./product-grid-styles.css";
import ProductCard from "../ProductCard/ProductCard";

function ProductGrid() {
    let arr = [];
    for (let i = 1; i < 13; i++) {
        arr.push(i);
    }
    return (
        <section className="product-grid-root">
            {arr.map((i) => (
                <ProductCard key={i} />
            ))}
        </section>
    );
}

export default ProductGrid;
