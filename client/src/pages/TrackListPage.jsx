import {useParams} from "react-router-dom";
import {useState, useEffect} from "react";

import API_URL from "../config/api";

import {useCart} from "../context/CartContext";
//import mockAlbums from "../data/mockAlbums";
import BeatList from "../components/BeatList";

function TrackListPage(){

    const {albumId}=useParams();
    const {addAlbumToCart} = useCart();
    
    //State
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAlbum(){
            try{
                const response = await fetch(`${API_URL}/api/albums/${albumId}`);

                if(!response.ok){
                    throw new Error("could not fetch album");
                }

                
                const data = await response.json();

                setAlbum(data);
            }catch (error){
                console.error("Failed to fetch album:", error);
                setError("Could not load album.");
            }finally{
                setLoading(false);
            }
        };

        fetchAlbum();

    }, [albumId])/* <-- kör effect igen ifall id förändras*/

    if (loading){
        return(
            <section>
                <h1>Loading...</h1>
            </section>
        );
    };

    if(error){
        return(
            <section>
                <h1>Album not found</h1>
                <h2>{error}</h2>
            </section>
        );
    };

    return(
        <section className="album-details-page" style={{"--album-cover": `url(${album.coverImage})`}}>
            <div className="album-details_overlay">

                <div className="album-details_div">

                    <div className="album-details_meta">
                        <img className="album-details_cover" src={album.coverImage}
                            alt={`Cover for ${album.albumName}`}
                        />

                        <h1>{album.albumName}</h1>
                    </div>
                </div>

                <div className ="album-details_info">
                        {/* <img className="album-details_cover" src={album.coverImage} alt={`Cover for ${album.albumName}`} /> */}
                        <p>{album.releaseYear}</p>
                        <p>Price: {album.albumPrice} kr</p>

                        <button type="button" onClick={()=> addAlbumToCart(album)}>
                            Add album to cart
                        </button>
                </div>
            </div>
            
            <h2>Tracks</h2>
            <BeatList beats={album.beats} />
        </section>
    );
};

export default TrackListPage;