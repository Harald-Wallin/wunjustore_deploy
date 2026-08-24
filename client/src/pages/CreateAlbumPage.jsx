import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateAlbumPage() {
    const navigate = useNavigate();

    //albumvärden
    const [albumName, setAlbumName] = useState("");
    const [albumPrice, setAlbumPrice] = useState("");
    const [releaseYear, setReleaseYear] = useState("");
    const [coverImage, setCoverImage] = useState("");
    //"meta"värden
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);


    async function handleSubmit(event){

        event.preventDefault();//Förhindrar HTTP's default att ladda om sidan vid submit

        try {
            setIsSubmitting(true);
            setError(null);

            const response = await fetch("http://localhost:3000/api/albums",
                {
                    method: "POST",

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

            if (!response.ok) {
                throw new Error(data.message || "Could not create album");
            };

            const newAlbumId = data.album.id;

            navigate(`/admin/albums/${newAlbumId}/edit`);

        } catch (error) {

            console.error("Failed to create album:",error);
            setError(error.message);

        } finally {
            setIsSubmitting(false);
        };
    };


    function handleCancel() {
        navigate("/admin/albums");
    }


    return (
        <section className="create-album-page">

            <h1>Create Album</h1>

            <form className="album-form" onSubmit={handleSubmit}>

                <label>
                    Album name

                    <input type="text" value={albumName} onChange={(event) =>
                            setAlbumName(event.target.value)
                        }
                        required
                    />
                </label>


                <label>
                    Album price

                    <input type="number" step="0.01" min="0" value={albumPrice} onChange={(event) =>
                            setAlbumPrice(event.target.value)
                        }
                        required
                    />
                </label>

                <label>
                    Release year

                    <input type="number" value={releaseYear} onChange={(event) =>
                            setReleaseYear(event.target.value)
                        }
                    />
                </label>

                <label>
                    Cover image URL

                    <input type="text" value={coverImage} monChange={(event) =>
                            setCoverImage(event.target.value)
                        }
                        placeholder="/images/example.jpg"
                    />
                </label>

                {/*Liten sjysst cover-preview..*/}
                {coverImage && 
                    (<div className="album-form_preview"><p>Cover preview:</p>
                        <img src={coverImage} alt="Album cover preview"/>
                    </div>
                )}


                {error && (<p className="form-error">{error}</p>)}

                <div className="album-form_actions">

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating album...": "Create album"}
                    </button>


                    {/*Tänkte först ha en Link till "/" men känns mer UX att ha en 
                    faktisk cancel-knapp */}
                    <button type="button" onClick={handleCancel} disabled={isSubmitting}>
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );
};

export default CreateAlbumPage;