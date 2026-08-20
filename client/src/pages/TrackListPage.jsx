import {Link, useParams} from "react-router-dom";

import mockAlbums from "../data/mockAlbums";
import BeatList from "../components/BeatList";

function TrackListPage(){

    const {albumId}=useParams();

    const album = mockAlbums.find(
        (currentAlbum) => currentAlbum.id == Number(albumId)
    );

    {/*Litet catch */}
    if(!album){
        return(
            <section>
                <h1>Album not found</h1>
                <p>The requested album does not exist (yet..?)</p>
            </section>
        )
    }

    return(
        <section>
            <div className="album-details_div">
                <h1>{album.albumName}</h1>

                <img className="album-details_cover" src={album.coverImage} alt={`Cover for ${album.albumName}`} />

                <p>{album.description}</p>
                <p>{album.releaseYear}</p>
                <p>Price: {album.albumPrice}</p>

                <button type="button">
                    Add to cart
                </button>
            </div>

            <h2>Tracks</h2>
            <BeatList beats={album.beats} />
        </section>
    );
};

export default TrackListPage;