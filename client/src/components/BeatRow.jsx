function BeatRow({beat}){
    return(
        <article className="beat-row">
            <div className="beat-row_info">
                <h3>{beat.beatName}</h3>
            </div>
            <div className="beat-row_actions">
                <button type="button">
                    Preview
                </button>

                <p>Price: {beat.price}</p>
                <button type="button">
                    Add to cart
                </button>
            </div>
        </article>
    );
};

export default BeatRow;