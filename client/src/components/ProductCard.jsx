function ProductCard({ product }) {

    return (
        <article className="product-card">

            <div className="product-card_image">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name}/>
                ):(
                    <div className="product-card_placeholder">
                        No image available ):
                    </div>
                )}
            </div>

            <div className="product-card_info">

                <h2>{product.name}</h2>

                <p>{Number(product.price).toFixed(2)} kr</p>

                <p>{product.stock > 0 ? "In stock" : "Out of stock ):"}</p>

            </div>

        </article>
    );
}

export default ProductCard;