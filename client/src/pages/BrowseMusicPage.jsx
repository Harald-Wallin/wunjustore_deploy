import AlbumCard from "../components/AlbumCard";
import mockAlbums from "../data/mockAlbums";

//styling
import "../album.css";

function BrowseMusicPage(){
    return(
        <section>
            <h1>Browse Music</h1>
            
            {/*.map går här igenom mockAlbums-arrayen och skapar ett AlbumCard per objekt */}
            <div>
                {mockAlbums.map((album)=>(
                    <AlbumCard key={album.id} album={album} />
                ))};
            </div>
        </section>
    );
};

export default BrowseMusicPage;