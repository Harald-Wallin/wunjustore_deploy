import BeatRow from "./BeatRow";

function BeatList({beats}){
    if (beats.length === 0){
        return (
            <p>This album doesn't have any beats (yet..?)</p>
        );
    };

    return(
        <div className="beat-list">
            {beats.map((currentBeat) => (
                <BeatRow key={currentBeat.id} beat={currentBeat} />
            ))}
        </div>
    );
};

export default BeatList;