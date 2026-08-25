import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function AdminAlbumsPage() {

    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        async function fetchAlbums() {
            try {
                const response = await fetch("http://localhost:3000/api/albums");

                if (!response.ok){
                    throw new Error("Could not fetch albums");
                };

                const data = await response.json();
                setAlbums(data);

            } catch (error){
                console.error("Failed to fetch albums:",error);

                setError("Could not load albums");

            } finally{
                setLoading(false);
            };
        };

        fetchAlbums();

    },[]);


    //Loading..
    if (loading){
        return (
            <section>
                <h1>Manage Albums</h1>
                <p>Loading albums...</p>
            </section>
        );
    };

    //error..
    if (error) {
        return (
            <section>
                <h1>Manage Albums</h1>
                <p>{error}</p>
            </section>
        );
    };


    return(
        <section className="admin-albums-page">
            <div className="admin-albums_header">

                <h1>Manage Albums</h1>

                <Link to="/admin/albums/new" className="admin-create-button">
                    + Create Album
                </Link>
            </div>


            <div className="admin-albums_list">

                {albums.map((currentAlbum) => (
                    <article key={currentAlbum.id} className="admin-album-row">

                        <img className="admin-album-cover"
                            src={currentAlbum.coverImage}
                            alt={`Cover for ${currentAlbum.albumName}`}
                        />


                        <div className="admin-album-info">

                            <h2>{currentAlbum.albumName}</h2>

                            <p>Release year: {currentAlbum.releaseYear}</p>
                            <p> Price: {currentAlbum.albumPrice.toFixed(2)} kr</p>
                            <p>Beats: {currentAlbum.beats.length}</p>
                        </div>


                        <div className="admin-album-actions">

                            {/* */}
                            <Link to={`/admin/albums/${currentAlbum.id}/edit`}>Edit</Link>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default AdminAlbumsPage;