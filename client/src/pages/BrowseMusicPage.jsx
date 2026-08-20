import AlbumCard from "../components/AlbumCard";
import mockAlbums from "../data/mockAlbums";

function BrowseMusicPage(){
    return(
        <section className="browse-music_section">
            <h1>Browse Music</h1>
            
            {/*.map går här igenom mockAlbums-arrayen och skapar ett AlbumCard per objekt */}
            <div className="browse-music_div">
                {mockAlbums.map((currentAlbum)=>(
                    <AlbumCard key={currentAlbum.id} album={currentAlbum} />
                ))}
            </div>
        </section>
    );
};

export default BrowseMusicPage;