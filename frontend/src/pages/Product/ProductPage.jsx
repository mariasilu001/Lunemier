import React from "react";
import Header from "../../layouts/MainLayout/components/Header";
import ProductDetails from "./components/ProductDetails";
import ProductReviews from "./components/ProductReviews";
import "./styles/product-details-styles.css";

function ProductPage() {
    return (
        <div className="product-page-root">
            <Header />
            <main className="product-page-main">
                <ProductDetails />
                <ProductReviews />
            </main>
        </div>
    );
}

export default ProductPage;
