import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function AlbumEditorPage() {
    const { albumId } = useParams();
    const navigate = useNavigate();

    
    const [albumName, setAlbumName] = useState("");
    const [albumPrice, setAlbumPrice] = useState("");
    const [releaseYear, setReleaseYear] = useState("");
    const [coverImage, setCoverImage] = useState("");

    const [beats, setBeats] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);


    useEffect(() => {
        async function fetchAlbum() {
            try {
                const response = await fetch(`http://localhost:3000/api/albums/${albumId}`);

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Could not fetch album");
                };

                setAlbumName(data.albumName);
                setAlbumPrice(data.albumPrice);
                setReleaseYear(data.releaseYear ?? "");
                setCoverImage(data.coverImage ?? "");
                setBeats(data.beats);

            } catch (error) {
                console.error("Failed to fetch album:",error);

                setError(error.message);
            } finally {
                setLoading(false);
            };
        };

        fetchAlbum();

    }, [albumId]);


    async function handleSubmit(event) {
        event.preventDefault();

        try{
            setIsSubmitting(true);
            setError(null);
            setSuccessMessage(null);


            const response = await fetch(
                `http://localhost:3000/api/albums/${albumId}`,
                {
                    method: "PUT",



                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        albumName,
                        albumPrice,
                        releaseYear,
                        coverImage
                    })
                }
            );


            const data = await response.json();


            if (!response.ok){
                throw new Error(data.message || "Could not update album");
            };


            setSuccessMessage("Album updated!");

        } catch (error){

            console.error("Failed to update album:",error);
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        };
    };


    if (loading){
        return(
            <section>
                <h1>Loading album...</h1>
            </section>
        );
    };


    if (error && !albumName){
        return(
            <section>
                <h1>Could not load album</h1>
                <p>{error}</p>
            </section>
        );
    }


    return(
        <section className="album-editor-page">

            <h1>Edit Album</h1>


            <form className="album-form" onSubmit={handleSubmit}>

                <label>
                    Album name

                    <input type="text" value={albumName}
                        onChange={(event) =>
                            setAlbumName(event.target.value)
                        }
                        required
                    />
                </label>


                <label>
                    Album price

                    <input type="number" step="0.01" min="0" value={albumPrice}
                        onChange={(event) =>
                            setAlbumPrice(event.target.value)
                        }
                        required
                    />
                </label>


                <label>
                    Release year

                    <input type="number" value={releaseYear}
                        onChange={(event) =>
                            setReleaseYear(event.target.value)
                        }
                    />
                </label>


                <label>
                    Cover image URL

                    <input type="text" value={coverImage}
                        onChange={(event) =>
                            setCoverImage(event.target.value)
                        }
                    />
                </label>


                {coverImage && (
                    <img className="album-editor-cover" src={coverImage} 
                    alt={`Cover for ${albumName}`}/>
                )}


                {error && (<p className="form-error">{error}</p>)};

                {successMessage && (<p className="form-success">{successMessage}</p>)};

                <div className="album-form_actions">

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save changes"}
                    </button>


                    <button type="button"onClick={() => navigate("/admin/albums")}>
                        Back
                    </button>
                </div>
            </form>


            <section className="album-editor-beats">
                <div className="album-editor-beats_header">

                    <h2>Beats</h2>

                    <Link to={`/admin/beats/new?albumId=${albumId}`}>
                        + Create Beat
                    </Link>
                </div>


                {beats.length === 0 ? (<p>This album has no beats.</p>) : 
                (
                    <div className="album-editor-beats_list">
                        {beats.map((currentBeat) => (

                            <article key={currentBeat.id} className="album-editor-beat-row">
                                <div>
                                    <h3>{currentBeat.beatName}</h3>

                                    <p>{currentBeat.beatPrice.toFixed(2)} kr</p>
                                </div>


                                <Link to={`/admin/beats/${currentBeat.id}/edit`}>
                                    Edit
                                </Link>
                            </article>
                        ))};

                    </div>
                )};
            </section>
        </section>
    );
};

export default AlbumEditorPage;