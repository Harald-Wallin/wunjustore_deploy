function BeatRow({beat}){
    return(
        <article className="beat-row">

            <div className="beat-row_info">
                <h3>{beat.beatName}</h3>
            </div>

            <div className="beat-row_actions">

                <audio controls preload="none" className="preview-player">
                    <source src={beat.previewUrl} type="audio/mpeg" />
                    Your browser does not support audio playback.
                </audio>

                <p>Price: {beat.beatPrice}</p>
                <button type="button">
                    Add to cart
                </button>
            </div>

        </article>
    );
};

export default BeatRow;