import {Link} from "react-router-dom";

function HomePage(){
    return(
        <section>

            <div className="home-page_news">
                <h1> So what's the latest from Wunju?</h1>

                {/*Hårdkodad non-existent "NewsCard" */}
                <Link to={`/albums/9`}>
                    <img className="news-hero" src="../public/images/mixedBitsVol3.jpg"
                    alt="Hero-cover"></img>
                </Link>
                <h2>Mixed Bits Vol.3</h2>

                <h3>Latest release now on Spotify, Youtube, AppleMusic and 
                    all your favourite music-streaming sites.
                </h3>
            </div>
        </section>
    )
}

export default HomePage;