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

        </section>
    );
}

export default SupplierImportPanel;