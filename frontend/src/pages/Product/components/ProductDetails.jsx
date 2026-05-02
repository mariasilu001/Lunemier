import React, { useState } from "react";
import "../styles/product-details-styles.css";

function ProductDetails() {
    const mockPhotos = [
        "https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg",
        "https://i.pinimg.com/736x/29/00/dc/2900dcc3535786730e364e31f8b4155d.jpg",
        "https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg"
    ];

    const [activePhoto, setActivePhoto] = useState(mockPhotos[0]);

    return (
        <div className="product-details-container">
            <div className="product-gallery-section">
                <div className="product-thumbnails-column">
                    {mockPhotos.map((photo, index) => (
                        <img 
                            key={index} 
                            src={photo} 
                            alt={`thumbnail-${index}`} 
                            className={`product-thumbnail ${activePhoto === photo ? 'active' : ''}`}
                            onClick={() => setActivePhoto(photo)}
                        />
                    ))}
                </div>
                <div className="product-main-image-wrapper">
                    <img src={activePhoto} alt="main-product" className="product-main-image" />
                </div>
            </div>

            <div className="product-info-section">
                <h1 className="product-info-title">Этническое платье 'Ночная тень'</h1>
                <div className="product-info-rating-row">
                    <span className="product-info-stars">★★★★☆</span>
                    <span className="product-info-reviews-count">4,9</span>
                </div>
                <p className="product-info-price">4500.0 ₽</p>
                <p className="product-info-description">
                    Идеальная вещь для тех, кто хочет скрыть свою хрупкость от посторонних глаз. 
                    Оно обернет тебя, защитит и напомнит о том, кому ты принадлежишь.
                </p>
                
                <div className="product-info-sizes">
                    <p className="sizes-label">Размер:</p>
                    <div className="sizes-grid">
                        <button className="size-btn">XS</button>
                        <button className="size-btn active">S</button>
                        <button className="size-btn">M</button>
                        <button className="size-btn">L</button>
                    </div>
                </div>

                <button className="product-add-to-cart-btn">Добавить в корзину</button>
            </div>
        </div>
    );
}

export default ProductDetails;