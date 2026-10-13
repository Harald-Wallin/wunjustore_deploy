import { useEffect, useState } from "react";

import API_URL from "../config/api";
import ProductCard from "../components/ProductCard";
import SupplierImportPanel from "../components/SupplierImportPanel";
import { useUser } from "../context/UserContext";

function MerchPage() {

    const { currentUser } = useUser();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //Kan anropas både vid sidladdning och efter import
    async function fetchProducts() {

        try {
            setError(null);

            const response = await fetch(`${API_URL}/api/products`);

            if (!response.ok) {
                throw new Error("Could not fetch products ):");
            }

            const data = await response.json();

            setProducts(data);

        } catch (error) {
            console.error("Failed to fetch products:", error);
            setError(error.message);
            throw error;

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts().catch(() => {});
    }, []);

    return (
        <section className="merch-page">

            <h1>Merchandise</h1>

            {/*Endast admin får se importpanelen*/}
            {currentUser?.role === "admin" && (
                <SupplierImportPanel onImportComplete={fetchProducts}/>
            )}

            {loading ?(
                <p>Loading products...</p>

            ): error ?(
                <p className="form-error" role="alert">{error}</p>

            ): products.length === 0 ?(
                <p>No products available ):</p>

            ): (
                <div className="product-grid">

                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}

                </div>
            )}

        </section>
    );
}

export default MerchPage;