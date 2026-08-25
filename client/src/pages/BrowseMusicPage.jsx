import AlbumCard from "../components/AlbumCard";
import {useEffect, useState} from "react";
import API_BASE_URL from "../config/api";

function BrowseMusicPage(){

    const [albums, setAlbums]=useState([]);
    const [loading, setLoading]=useState(true);
    const [error, setError] = useState(null);

    //useEffect
    useEffect(() => {
        async function fetchAlbums(){
            try{
                const response = await fetch(`${API_BASE_URL}/api/albums`);

                if (!response.ok){
                    throw new Error("Could not fetch albums");
                }

                const data = await response.json();
                setAlbums(data);
            }catch (error){
                console.error("Failed to fetch albums (this time..):", error);

                setError("Could not load albums");
            }finally{
                setLoading(false);
            }
        }

        fetchAlbums();
    }, []);

    if (loading){
        return(
            <section>
                <h1>Browse Music</h1>
                <h2>Loading albums...</h2>
            </section>
        )
    }

    if (error){
        return (
            <section>
               <h1>Browse Music</h1>
               <h2>{error}</h2> 
            </section>
        )
    };


    return(
        <section className="browse-music_section">
            <h1>Browse Music</h1>

            {/*.map gör ett AlbumCard per album i databasen*/}
            <div className="browse-music_div">

                {albums.map((album)=> (
                    <AlbumCard key={album.id} album={album} />
                ))}
            </div>
        </section>
    );
};

export default BrowseMusicPage;