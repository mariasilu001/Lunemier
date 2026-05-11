import React from "react";
import ProductGrid from "../../../components/ProductGrid/ProductGrid";

function SelectBase() {
    return (
        <>
            <p
                className="customizator-banner-header"
                style={{ marginBottom: "20px" }}
            >
                Выберите основу для своего дизайна
            </p>
            <ProductGrid isBaseMode={true} />
        </>
    );
}

export default SelectBase;
