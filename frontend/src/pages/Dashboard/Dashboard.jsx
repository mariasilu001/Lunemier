import React from "react";
import LatestOrder from "./components/LatestOrder";
import CustomizatorBanner from "./components/CustomizatorBanner";
import ProductGrid from "../../components/ProductGrid/ProductGrid";

function Dashboard() {
    return (
        <>
            <CustomizatorBanner />
            <LatestOrder />
            <ProductGrid />
        </>
    );
}

export default Dashboard;
