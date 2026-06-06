import React, { createContext, useState, useEffect } from "react";
import localforage from "localforage";
import { mockUsers } from "./dummy/users";
import { mockProducts } from "./dummy/products";
import { mockOrders } from "./dummy/orders";
import { mockReviews } from "./dummy/reviews";
import { mockCategories } from "./dummy/categories";
import { mockSizes } from "./dummy/sizes";
import { mockSuppliers } from "./dummy/suppliers";
import { mockPickupPoints } from "./dummy/pickupPoints";
import { mockPaymentMethods } from "./dummy/paymentMethods";
import { mockPickupCodes } from "./dummy/pickupCodes";

export const GlobalContext = createContext();

const base64ToBlob = (base64String) => {
    const parts = base64String.split(",");
    if (parts.length !== 2) return null;

    const mime = parts[0].match(/:(.*?);/)[1];

    const byteString = atob(parts[1]);

    let n = byteString.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = byteString.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
};

export const ContextProvider = ({ children }) => {
    const [users, setUsers] = useState(null);
    const [products, setProducts] = useState(null);
    const [orders, setOrders] = useState(null);
    const [reviews, setReviews] = useState(null);
    const [categories, setCategories] = useState(null);
    const [sizes, setSizes] = useState(null);
    const [suppliers, setSuppliers] = useState(null);
    const [pickupPoints, setPickupPoints] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState(null);
    const [pickupCodes, setPickupCodes] = useState(null);

    useEffect(() => {
        const initializeData = async () => {
            const storedUsers = await localforage.getItem("users");
            const storedProducts = await localforage.getItem("products");
            const storedOrders = await localforage.getItem("orders");
            const storedReviews = await localforage.getItem("reviews");
            const storedCategories = await localforage.getItem("categories");
            const storedSizes = await localforage.getItem("sizes");
            const storedSuppliers = await localforage.getItem("suppliers");
            const storedPickupPoints =
                await localforage.getItem("pickupPoints");
            const storedPaymentMethods =
                await localforage.getItem("paymentMethods");
            const storedPickupCodes = await localforage.getItem("pickupCodes");

            if (
                !storedUsers ||
                !storedProducts ||
                !storedOrders ||
                !storedReviews ||
                !storedCategories ||
                !storedSizes ||
                !storedSuppliers ||
                !storedPickupPoints ||
                !storedPaymentMethods ||
                !storedPickupCodes
            ) {
                await localforage.setItem("users", mockUsers);
                //----------------------------------
                const processedProducts = mockProducts.map((p) => {
                    // 1. Создаем копию всего объекта продукта, чтобы не мутировать оригинал
                    const newProduct = { ...p };

                    // 2. Обрабатываем переднюю фотографию
                    if (newProduct.front_photo_url) {
                        newProduct.front_photo_url = base64ToBlob(
                            newProduct.front_photo_url,
                        );
                    }

                    // 3. Обрабатываем заднюю фотографию
                    if (newProduct.back_photo_url) {
                        newProduct.back_photo_url = base64ToBlob(
                            newProduct.back_photo_url,
                        );
                    }

                    // 4. Обрабатываем массив базовых фотографий
                    if (newProduct.photos && Array.isArray(newProduct.photos)) {
                        newProduct.photos = newProduct.photos.map(
                            (photoObj) => {
                                const newPhotoObj = { ...photoObj };
                                if (newPhotoObj.file_path) {
                                    newPhotoObj.file_path = base64ToBlob(
                                        newPhotoObj.file_path,
                                    );
                                }
                                return newPhotoObj;
                            },
                        );
                    }

                    // 5. Обрабатываем массив кастомных фотографий
                    if (
                        newProduct.custom_photos &&
                        Array.isArray(newProduct.custom_photos)
                    ) {
                        newProduct.custom_photos = newProduct.custom_photos.map(
                            (customPhotoObj) => {
                                const newCustomPhotoObj = { ...customPhotoObj };
                                if (newCustomPhotoObj.file_path) {
                                    newCustomPhotoObj.file_path = base64ToBlob(
                                        newCustomPhotoObj.file_path,
                                    );
                                }
                                return newCustomPhotoObj;
                            },
                        );
                    }

                    return newProduct;
                });
                await localforage.setItem("products", processedProducts);
                //----------------------------------
                await localforage.setItem("orders", mockOrders);
                await localforage.setItem("reviews", mockReviews);
                await localforage.setItem("categories", mockCategories);
                await localforage.setItem("sizes", mockSizes);
                await localforage.setItem("suppliers", mockSuppliers);
                await localforage.setItem("pickupPoints", mockPickupPoints);
                await localforage.setItem("paymentMethods", mockPaymentMethods);
                await localforage.setItem("pickupCodes", mockPickupCodes);

                setUsers(mockUsers);
                setProducts(processedProducts);
                setOrders(mockOrders);
                setReviews(mockReviews);
                setCategories(mockCategories);
                setSizes(mockSizes);
                setSuppliers(mockSuppliers);
                setPickupPoints(mockPickupPoints);
                setPaymentMethods(mockPaymentMethods);
                setPickupCodes(mockPickupCodes);
            } else {
                setUsers(storedUsers);
                setProducts(storedProducts);
                setOrders(storedOrders);
                setReviews(storedReviews);
                setCategories(storedCategories);
                setSizes(storedSizes);
                setSuppliers(storedSuppliers);
                setPickupPoints(storedPickupPoints);
                setPaymentMethods(storedPaymentMethods);
                setPickupCodes(storedPickupCodes);
            }
        };
        initializeData();
    }, []);

    useEffect(() => {
        if (users !== null) {
            localforage.setItem("users", users);
        }
    }, [users]);

    useEffect(() => {
        if (products !== null) {
            localforage.setItem("products", products);
        }
    }, [products]);

    useEffect(() => {
        if (orders !== null) {
            localforage.setItem("orders", orders);
        }
    }, [orders]);

    useEffect(() => {
        if (reviews !== null) {
            localforage.setItem("reviews", reviews);
        }
    }, [reviews]);

    useEffect(() => {
        if (categories !== null) {
            localforage.setItem("categories", categories);
        }
    }, [categories]);

    useEffect(() => {
        if (sizes !== null) {
            localforage.setItem("sizes", sizes);
        }
    }, [sizes]);

    useEffect(() => {
        if (suppliers !== null) {
            localforage.setItem("suppliers", suppliers);
        }
    }, [suppliers]);

    useEffect(() => {
        if (pickupPoints !== null) {
            localforage.setItem("pickupPoints", pickupPoints);
        }
    }, [pickupPoints]);

    useEffect(() => {
        if (paymentMethods !== null) {
            localforage.setItem("paymentMethods", paymentMethods);
        }
    }, [paymentMethods]);

    useEffect(() => {
        if (pickupCodes !== null) {
            localforage.setItem("pickupCodes", pickupCodes);
        }
    }, [pickupCodes]);

    return (
        <GlobalContext.Provider
            value={{
                users,
                setUsers,
                products,
                setProducts,
                orders,
                setOrders,
                reviews,
                setReviews,
                categories,
                setCategories,
                sizes,
                setSizes,
                suppliers,
                setSuppliers,
                pickupPoints,
                setPickupPoints,
                paymentMethods,
                setPaymentMethods,
                pickupCodes,
                setPickupCodes,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};
