import {useState} from "react";
import {useNavigate, Link, useSearchParams} from "react-router-dom";
import {useUser} from "../context/UserContext.jsx";
import API_URL from "../config/api.js";

function LoginPage()
{
    const navigate = useNavigate();

    const { currentUser, login } = useUser();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchParams] = useSearchParams();
    const googleError = searchParams.get("googleError");
    
    let googleErrorMessage = null; 

    //sätter mer begripliga felmeddelanden
    if (googleError === "cancelled"){

        googleErrorMessage = "Google sign-in was cancelled";
    }else if (googleError){

        googleErrorMessage = "Could not complete google sign-in. Please try again";
    }
    
    const loginError = error || googleErrorMessage;

    async function handleLogin(event){

        event.preventDefault();

        setError(null);
        setIsSubmitting(true);

        try {
            await login(email.trim(), password);

            navigate("/");

        } catch (error) {
            setError(error.message);

        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="login-page">

            <h1>Login with email</h1>

            <div className="login-page_info">
                <p><strong>Test accounts</strong></p>

                <p><strong>Customer:</strong></p>
                <p>Email: customer@test.com</p>
                <p>Password: customer123</p>

                <p><strong>Admin:</strong></p>
                <p>Email: admin@test.com</p>
                <p>Password: admin123</p>
            </div>

            <form onSubmit={handleLogin}>

                <label>
                    Email

                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="username"
                        required
                    />
                </label>

                <label>
                    Password

                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </label>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                </button>

            </form>

            <p><a href={`${API_URL}/api/auth/google`}>Sign in with Google instead</a></p>

            {loginError && (<p className="login-page_error" role="alert">{loginError}</p>)}

            <Link to="/">Back</Link>

            {currentUser && (<p>Currently logged in as: {currentUser.name}</p>)}

        </section>
    );
}

export default LoginPage;
