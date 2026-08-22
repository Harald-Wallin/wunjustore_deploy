import { Link } from "react-router-dom";

import {useCart} from "../context/CartContext";

function AlbumCard({album}){

    const {addAlbumToCart} = useCart();

    return(
        <article className="album-card_browse">
            <Link to={`${album.id}`} className="album-card_cover-link">
                <img src={album.coverImage} alt={`Cover for ${album.albumName}`}
                    className="album-card_cover"
                />
            </Link>

            <div className="album-card_content">
                <h2>{album.albumName}</h2>
                <p>{album.releaseYear}</p>
                <p>{album.description}</p>
                <p>{album.albumPrice}</p>

                <div className="album-card_actions">
                    <Link to={`${album.id}`}>
                        Browse Beats
                    </Link>

                    <button type="button" onClick={()=>{addAlbumToCart(album)}}>                         
                        Add to cart
                    </button>
                </div>
            </div>
        </article>
    );
};

export default AlbumCard;