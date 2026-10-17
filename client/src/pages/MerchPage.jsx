import { useEffect, useState } from "react";

import API_URL from "../config/api";
import ProductCard from "../components/ProductCard";
import SupplierImportPanel from "../components/SupplierImportPanel";
import { useUser } from "../context/UserContext";

//produkter per sida
const PAGE_SIZE = 12;

function MerchPage() {

    //user
    const { currentUser } = useUser();

    //products
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //search, pagienering
    const [searchText, setSearchText] = useState("");//texten användaren skriver
    const [page, setPage] = useState(1);             //vilken page användaren befinner sig på
    const [totalPages, setTotalPages] = useState(0); //hur många sidor algolia säger finns
    const [refreshCount, setRefreshCount] = useState(0);

    const [totalProducts, setTotalProducts] = useState(0);



    //Kan anropas både vid sidladdning och efter import. 'Signal' används för att kunna
    //avbryta äldre sökningar
    async function fetchProducts(signal) {

        setLoading(true);

        try {
            setError(null);

            //t.ex "/api/search?q=hoodie&page=2&pageSize=9"
            const isSearching = searchText.trim().length > 0;

            let url;

            if(isSearching){
                const params = new URLSearchParams({
                    q: searchText,
                    page: String(page),
                    pageSize: String(PAGE_SIZE)
                })

                url = `${API_URL}/api/search?${params}`;

            }else {
                url = `${API_URL}/api/products`;
            }

            const response = await fetch(url, {signal});

            if (!response.ok){

                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.error || errorData?.message || "Could not fetch products ):");
                }


            const result = await response.json();

            //Då det är databasen som ger resultaten OM inte någon SÖKTEXT finns 
            //så måste resultaten formas på passande sätt, jämfört med när det ar algolia
            //som ger resultaten

            if (isSearching) {
                //algolia-format
                setProducts(result.data);
                setTotalPages(result.meta.totalPages);
                setTotalProducts(result.meta.total);

            } else {
                //databas-format
                setProducts(result);
                setTotalPages(Math.ceil(result.length / PAGE_SIZE));
                setTotalProducts(result.length);

            }

        } catch (error) {

            if(error.name === "AbortError"){
                return;
            }

            console.error("Failed to fetch products:", error);
            setError(error.message);

        } finally {

            //om anropet avbrutits innan laddningsstatus ändras. 'signal?.' = om det finns
            //en signal > läs aborted
            if(!signal?.aborted){
                setLoading(false);
            }
        }
    }

    useEffect(() => {

        //inbyggd klass som kan avbryta HTTP-anrop/asynkrona arbeten
        const controller = new AbortController();

        fetchProducts(controller.signal);

        return () => controller.abort();

        //omkörs när användare anger text, byter sida, admin uppdaterar import
    }, [searchText, page, refreshCount]);

    //om användare står på t.ex page 4 och börjar söka > tillbaks till 1
    function handleSearchChange(event) {
        setSearchText(event.target.value);
        setPage(1);
    }

    //så vi slipper anropa fetchProducts vid uppdatering
    function handleImportComplete() {
        setRefreshCount((count) => count + 1);
    }

    const isSearching = searchText.trim().length > 0;

    const visibleProducts = isSearching
        ? products
        : products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <section className="merch-page">

            <h1>Merchandise</h1>

            {/*Endast admin får se importpanelen*/}
            {currentUser?.role === "admin" && (
                <SupplierImportPanel onImportComplete={handleImportComplete}/>
            )}

            <div className="merch-search">

                <input
                    id="merch-search-input"
                    type="search"
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder="Search for your favourite piece.."
                />

            </div>
            
            {!loading && !error && (
            <p className="merch-results-count">
                {totalProducts} {totalProducts === 1 ? "product" : "products"} found
            </p>
)}

            {loading ?(
                <p>Loading products...</p>

            ): error ?(
                <p className="form-error" role="alert">{error}</p>

            ): products.length === 0 ?(
                <p>No matching products found ):</p>

            ): (
                <div>
                    <div className="product-grid">

                        {visibleProducts.map((product) => (
                            <ProductCard
                                key={product.sku}
                                product={product}
                            />
                        ))}

                    </div>

                    {totalPages > 1 && (
                        <div className = "merch-pagination">

                            <button type = "button" disabled = {page === 1} onClick={() => setPage(page -1)}>
                                Previous
                            </button>

                            <span>
                                Page {page} of {totalPages}
                            </span>

                            <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                                Next
                            </button>
                        
                        </div>

                    )}
                </div>
            )}

        </section>
    );
}

export default MerchPage;