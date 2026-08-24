import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { useUser } from "../context/UserContext.jsx";

function LoginPage() {
    const navigate = useNavigate();

    const {currentUser, selectUser} = useUser();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);


    function handleLogin(event) {
        event.preventDefault();

        //Ganska opetig login-fejkning, men ändå en login-fejkning..
        const normalizedUsername = username.trim().toUpperCase();
        if (
            normalizedUsername === "USER" &&
            password === "123"
        ) {
            selectUser("customer");
            navigate("/");
            return;
        };

        if (
            normalizedUsername === "ADMIN" &&
            password === "123"
        ) {
            selectUser("admin");
            navigate("/");
            return;
        };

        setError("Incorrect username or password");
    };


    return(
        <section className="login-page">

            <h1>Login</h1>

            <div className="login-page_info">
                <p>Fake login for demonstration purposes.</p>

                <p>User login:<strong> USER / 123</strong></p>
                <p>Admin login:<strong> ADMIN / 123</strong></p>

            </div>


            <form onSubmit={handleLogin}>

                <label>
                    Username

                    <input type="text" value={username} onChange={
                        (event) => setUsername(event.target.value)
                    }/>

                </label>


                <label>
                    Password

                    <input type="password" value={password} onChange={  
                        (event) => setPassword(event.target.value)
                    }
                    />
                </label>


                <button type="submit">Login</button>
            </form>

            {error && (<p className="login-page_error">{error}</p>)}

            <Link to="/">Back</Link>

            {currentUser && (<p>Currently logged in as:{" "}{currentUser.name}</p>)};
            
        </section>
    );
};

export default LoginPage;