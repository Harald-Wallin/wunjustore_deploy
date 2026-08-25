import { useEffect, useState } from "react";
import {useNavigate,useParams} from "react-router-dom";

import API_URL from "../config/api";

function EditBeatPage(){

    const { beatId } = useParams();
    const navigate = useNavigate();

    const [albumId, setAlbumId] = useState("");
    const [beatName, setBeatName] = useState("");
    const [beatPrice, setBeatPrice] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [isDeleting, setIsDeleting] = useState(false)
    ;
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);


    useEffect(() => {

        async function fetchBeat() {

            try {
                const response = await fetch(`${API_URL}/api/beats/${beatId}`);

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Could not fetch beat");
                }

                setAlbumId(data.beat.albumId);
                setBeatName(data.beat.beatName);
                setBeatPrice(data.beat.beatPrice);
                setPreviewUrl(data.beat.previewUrl ?? "");


            } catch (error) {

                console.error("Failed to fetch beat:",error);

                setError(error.message);
            } finally{
                setLoading(false);
            };
        };

        fetchBeat();

    }, [beatId]);


    async function handleSubmit(event){

        event.preventDefault();

        try{

            setIsSubmitting(true);
            setError(null);
            setSuccessMessage(null);


            const response = await fetch(
                `${API_URL}/api/beats/${beatId}`,
                {
                    method: "PUT",
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
                throw new Error(data.message || "Could not update beat");
            };

            setSuccessMessage("Beat updated!");

        } catch (error){

            console.error("Failed to update beat:",error);

            setError(error.message);
        } finally{

            setIsSubmitting(false);
        };
    };

    async function handleDelete(){

        const confirmed = window.confirm(`Delete "${beatName}" permanently?`);

        if (!confirmed) {
            return;
        }


        try {
            setIsDeleting(true);
            setError(null);

            const response = await fetch(
                `${API_URL}/api/beats/${beatId}`,
                {
                 method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not delete beat");
            };

            //efter deleten navigeras användaren om
            navigate(`/admin/albums/${data.beat.albumId}/edit`);

        } catch (error){

            console.error("Failed to delete beat:",error);
            setError(error.message);

        } finally {

        setIsDeleting(false);
    };
};


    function handleBack() {
        navigate(`/admin/albums/${albumId}/edit`);
    };


    if (loading){
        return(
            <section>
                <h1>Loading beat...</h1>
            </section>
        );
    };


    if (error && !beatName){
        return(
            <section>
                <h1>Could not load beat</h1>
                <p>{error}</p>
            </section>
        );
    };


    return(
        <section className="edit-beat-page">

            <h1>Edit Beat</h1>

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

                    <input type="number" step="0.01" min="0"
                        value={beatPrice}
                        onChange={(event) =>
                            setBeatPrice(event.target.value)
                        }
                        required
                    />
                </label>


                <label>
                    Album ID

                    <input type="number" value={albumId}
                        onChange={(event) =>
                            setAlbumId(event.target.value)
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
                    />
                </label>


                {previewUrl && (
                    <audio controls preload="none">
                        <source src={previewUrl} type="audio/wav"/>
                        Your browser does not support audio playback )':
                    </audio>
                )}


                <strong>{error && (<p className="form-error">{error}</p>)}</strong>
                <strong>{successMessage && (<p className="form-success">{successMessage}</p>)}</strong>

                <div className="beat-form_actions">

                    
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save changes"}
                    </button>

                    <button type="button" onClick={handleDelete} 
                        disabled={isSubmitting || isDeleting}>
                            {isDeleting? "Deleting...": "Delete beat"}
                    </button>


                    <button type="button" onClick={handleBack} disabled={isSubmitting}>
                        Back
                    </button>

                </div>
            </form>
        </section>
    );
};

export default EditBeatPage;