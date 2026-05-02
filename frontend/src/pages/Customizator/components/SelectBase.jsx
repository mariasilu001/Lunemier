import React from "react";
import ProductGrid from "../../../components/ProductGrid/ProductGrid";

function SelectBase() {
    return (
        <>
            <p className="customizator-banner-header">
                Выберите основу{" "}
                <a href="/customizator/redactor">Перейти в редактор</a>
            </p>
            <ProductGrid />
        </>
    );
}

export default SelectBase;
