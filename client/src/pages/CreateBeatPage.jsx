import { useState } from "react";
import {useNavigate, useSearchParams} from "react-router-dom";

import API_URL from "../config/api";

function CreateBeatPage() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const albumId = searchParams.get("albumId");

    const [beatName, setBeatName] = useState("");
    const [beatPrice, setBeatPrice] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);


    async function handleSubmit(event) 
        {event.preventDefault();
            try {
                setIsSubmitting(true);
                setError(null);


                const response = await fetch(
                    `http://${API_URL}/api/beats`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            albumId,
                            beatName,
                            beatPrice,
                            previewUrl
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok){
                    throw new Error(data.message || "Could not create beat");
                };

                navigate(`/admin/albums/${albumId}/edit`);

            } catch (error){
                console.error("Failed to create beat:",error);

                setError(error.message);

            }finally {
                setIsSubmitting(false);
            };
        };


        //Implementera tydlig cancel-funktion koppat till en button ist för länk, håll standard
        function handleCancel(){
            navigate(`/admin/albums/${albumId}/edit`);
        };


    if (!albumId) {
        return(
            <section>
                <h1>Create Beat</h1>
                <p>No album was selected</p>
            </section>
        );
    };


    return (
        <section className="create-beat-page">

            <h1>Create Beat</h1>

            <p>Album ID: {albumId}</p>

            <form className="beat-form" onSubmit={handleSubmit}>

                <label>
                    Beat name

                    <input type="text" value={beatName}
                        onChange={(event) =>
                            setBeatName(event.target.value)
                        }
                        required
                    />
                </label>


                <label>
                    Beat price

                    <input type="number" step="0.01" min="0" value={beatPrice}
                        onChange={(event) =>
                            setBeatPrice(event.target.value)
                        }
                        required
                    />
                </label>


                <label>
                    Preview URL

                    <input type="text" value={previewUrl}
                        onChange={(event) =>
                            setPreviewUrl(event.target.value)
                        }
                        placeholder="/audio/previews/..."
                    />
                </label>


                {error && (<p className="form-error">{error}</p>)};

                <div className="beat-form_actions">

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating beat..." : "Create beat"}
                    </button>


                    <button type="button" onClick={handleCancel} disabled={isSubmitting}>
                        Cancel
                    </button>

                </div>
            </form>
        </section>
    );
};

export default CreateBeatPage;