import {Link, useParams} from "react-router-dom";
import mockAlbums from "../data/mockAlbums";

function TrackListPage(){

    const {albumId}=useParams();

    const album = mockAlbums.find(
        (album) => album.id == Number(albumId)
    );

    {/*Litet "säkerhetsuppfång" ifal */}
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
            <h1>{album.albumName}</h1>

            <img src={album.coverImage} alt={`Cover for ${album.albumName}`} />

            <p>{album.description}</p>
            <p>{album.releaseYear}</p>
            <p>Price: {album.albumPrice}</p>

            <button type="button">
                Add to cart
            </button>

            <h2>Tracks</h2>
            <p>förhoppningsvis en riktig lista här snart</p>
        </section>
    );
};

export default TrackListPage;