import { Link } from "react-router-dom";

import { useUser } from "../context/UserContext.jsx";

function ProfilePage() {
    const { currentUser } = useUser();

    if (!currentUser){
        return(
            <section>
                <h1>Profile</h1>

                <p>No user is currently logged in.</p>

                <Link to="/login">
                    Login
                </Link>
            </section>
        );
    };

    return(
        <section className="profile-page">

            <h1>Profile</h1>

            <div className="profile-card">

                <p><strong>Name:</strong>{" "}{currentUser.name}</p>
                <p><strong>Role:</strong>{" "}{currentUser.role}</p>
                <p><strong>User ID:</strong>{" "}{currentUser.id}</p>
            </div>


            <div className="profile-actions">

                <Link to="/account/orders">My Orders</Link>

                <Link to="/albums">Browse Music</Link>
            </div>
        </section>
    );
};

export default ProfilePage;