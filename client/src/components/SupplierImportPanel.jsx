import { useState } from "react";
import API_URL from "../config/api";

function SupplierImportPanel({ onImportComplete }) {

    const [format, setFormat] = useState("csv");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    //algolia-sync
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [syncError, setSyncError] = useState(null);

    //produkt-images från supabase
    const [imageFile, setImageFile] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageResult, setImageResult] = useState(null);
    const [imageError, setImageError] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState(null);


    //Manuell, tillfällig produkthantering
    const [productForm, setProductForm] = useState({
        sku: "DEMO-001",
        ean: "DEMO-EAN-001",
        name: "Wunju Demo Hoodie",
        category: "Clothing",
        price: "299",
        stock: "10"
    });

    const [productLoading, setProductLoading] = useState(false);
    const [productResult, setProductResult] = useState(null);
    const [productError, setProductError] = useState(null);



    async function handleImport(event) {
        event.preventDefault();

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(
                `${API_URL}/api/admin/supplier/import`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ format })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || data.error || "Import failed"
                );
            }

            setResult(data);

            //en callback som säger åt MerchPage att importen är klar, säger åt
            //den att hämta produkter från databasen igen
            await onImportComplete();

        } catch (error) {
            console.error("Supplier import failed:", error);
            setError(error.message);

        } finally {
            setLoading(false);
        }
    }

    //algolia sync
    async function handleSync() {

        setSyncLoading(true);
        setSyncError(null);
        setSyncResult(null);

        try {
            const response = await fetch(`${API_URL}/api/admin/supplier/search/sync`,
                {
                    method: "POST"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || data.error || "Algolia sync failed"
                );
            }

            setSyncResult(data);

        } catch (error) {
            console.error("Algolia sync failed:", error);
            setSyncError(error.message);

        } finally {
            setSyncLoading(false);
        }
    }


//Uppdatera formulärfält
function handleProductChange(event) {

    const { name, value } = event.target;

    setProductForm((previous) => ({
        ...previous,
        [name]: value
    }));
}


//Skapa/uppdatera/ radera produkt (tillfällig, AI)
async function handleProductAction(action) {

    setProductLoading(true);
    setProductError(null);
    setProductResult(null);

    const sku = productForm.sku.trim();

    try {
        const isCreate = action === "create";
        const isUpdate = action === "update";

        const url = isCreate
            ? `${API_URL}/api/admin/products`
            : `${API_URL}/api/admin/products/${encodeURIComponent(sku)}`;

        const method = isCreate ? "POST" : isUpdate ? "PATCH" : "DELETE";

        let body;

        if (isCreate){
            body={
                sku,
                ean: productForm.ean.trim(),
                name: productForm.name.trim(),
                category: productForm.category.trim(),
                price: Number(productForm.price),
                stock: Number(productForm.stock)
            };
        }

        if (isUpdate) {
            body = {
                name: productForm.name.trim(),
                price: Number(productForm.price)
            };
        }

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            ...body && { body: JSON.stringify(body) }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || data.error || "Product operation failed"
            );
        }

        setProductResult({
            action,
            data
        });

        //Hämta produktlistan från PostgreSQL igen
        await onImportComplete();

    } catch (error) {
        console.error("Product operation failed:", error);
        setProductError(error.message);

    } finally {
        setProductLoading(false);
    }
}

//Ladda upp/ersätt produktbild
async function handleImageUpload() {

    if (!imageFile) {
        setImageError("Please select an image first.");
        return;
    }

    setImageLoading(true);
    setImageError(null);
    setImageResult(null);

    const sku = productForm.sku.trim();

    try{

        const formData = new FormData();
        formData.append("image", imageFile);

        const response = await fetch(
            `${API_URL}/api/admin/products/${encodeURIComponent(sku)}/image`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok){
            throw new Error(
                data.message || data.error || "Image upload failed."
            );
        }

        setImageResult("Image uploaded successfully!");
        setCurrentImageUrl(data.product.image_url);
        setImageFile(null);

        //Uppdatera produktlistan i MerchPage
        await onImportComplete();

    } catch (error){
        console.error("Image upload failed:", error);
        setImageError(error.message);

    } finally{
        setImageLoading(false);
    }
}


    return (
        <section className="supplier-import-panel">

            <h2>Supplier Management</h2>

            <p>Import products from supplier API.</p>

            <form onSubmit={handleImport}>

                <label htmlFor="supplier-format">
                    Import format
                </label>

                <select
                    id="supplier-format"
                    value={format}
                    onChange={(event) => setFormat(event.target.value)}
                    disabled={loading}
                >
                    <option value="csv">CSV</option>
                    <option value="xml">XML</option>
                </select>

                <button type="submit" disabled={loading || syncLoading}>
                    {loading ? "Importing..." : "Import products"}
                </button>

                <button type="button" onClick={handleSync} disabled={loading || syncLoading}>
                    {syncLoading ? "Syncing..." : "Sync Algolia"}
                </button>

            </form>

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            {result && (<div className="supplier-import-result">

                <h3>Import completed!</h3>

                <p>Total products: {result.total}</p>
                <p>Created: {result.created}</p>
                <p>Updated: {result.updated}</p>
                <p>Skipped: {result.skipped}</p>

                {result.searchSync?.success ?(
                    <p>Algolia sync. submitted. Products: {String(result.searchSync.indexed)}</p>
                ) : (
                    <p className = "form-error" role="alert">
                        Products imported but Algolia was not updated
                    </p>
                )}

                {result.skippedProducts?.length > 0 && (
                    <div>
                        <h4>Skipped products</h4>

                        <ul>
                            {result.skippedProducts.map((product, index) => (
                                <li key={`${product.sku}-${index}`}>
                                    <strong>{product.sku}</strong>
                                    {": "}
                                    {product.reasons.join(", ")}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </div>)}

            {syncError && (<p className="form-error" role="alert">{syncError}</p>)}

            {syncResult && (
                <div className="supplier-sync-result">

                    <h3>Search index updated!</h3>

                    <p>Total products: {syncResult.total}</p>
                    <p>Indexed: {syncResult.indexed}</p>

                </div>
            )}


                        {/* Manuell produkthantering, tillfällig */}
            <div className="supplier-product-management">

                <h2>Product Management</h2>

                <p>Create, update or delete products manually.</p>

                <form onSubmit={(event) => event.preventDefault()}>

                    <label htmlFor="product-sku">SKU</label>
                    <input
                        id="product-sku"
                        name="sku"
                        value={productForm.sku}
                        onChange={handleProductChange}
                        disabled={productLoading}
                        required
                    />

                    <label htmlFor="product-ean">EAN</label>
                    <input
                        id="product-ean"
                        name="ean"
                        value={productForm.ean}
                        onChange={handleProductChange}
                        disabled={productLoading}
                        required
                    />

                    <label htmlFor="product-name">Product name</label>
                    <input
                        id="product-name"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductChange}
                        disabled={productLoading}
                        required
                    />

                    <label htmlFor="product-category">Category</label>
                    <input
                        id="product-category"
                        name="category"
                        value={productForm.category}
                        onChange={handleProductChange}
                        disabled={productLoading}
                        required
                    />

                    <label htmlFor="product-price">Price</label>
                    <input
                        id="product-price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={productForm.price}
                        onChange={handleProductChange}
                        disabled={productLoading}
                        required
                    />

                    <label htmlFor="product-stock">Stock</label>
                    <input
                        id="product-stock"
                        name="stock"
                        type="number"
                        min="0"
                        step="1"
                        value={productForm.stock}
                        onChange={handleProductChange}
                        disabled={productLoading}
                        required
                    />

                    <div className="supplier-product-actions">

                        <button
                            type="button"
                            onClick={() => handleProductAction("create")}
                            disabled={productLoading || loading || syncLoading}
                        >
                            Create product
                        </button>

                        <button
                            type="button"
                            onClick={() => handleProductAction("update")}
                            disabled={productLoading || loading || syncLoading}
                        >
                            Update product
                        </button>

                        <button
                            type="button"
                            onClick={() => handleProductAction("delete")}
                            disabled={productLoading || loading || syncLoading}
                        >
                            Delete product
                        </button>

                    </div>

                </form>

                {productError && (
                    <p className="form-error" role="alert">
                        {productError}
                    </p>
                )}

                {productResult && (
                    <div className="supplier-import-result">

                        <h3>
                            {productResult.action === "create"
                                ? "Product created!"
                                : productResult.action === "update"
                                    ? "Product updated!"
                                    : "Product deleted!"}
                        </h3>

                        <p>SKU: {productResult.data.product.sku}</p>

                        {productResult.data.searchSync?.success ? (
                            <p>Algolia sync submitted successfully.</p>
                        ) : (
                            <p className="form-error" role="alert">
                                Database updated, but Algolia sync failed!
                            </p>
                        )}

                    </div>
                )}

            </div>

        </section>
    );
}

export default SupplierImportPanel;