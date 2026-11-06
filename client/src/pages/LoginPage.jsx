import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {useUser} from "../context/UserContext.jsx";

function LoginPage()
{
    const navigate = useNavigate();

    const { currentUser, login } = useUser();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

            <h1>Login</h1>

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

            {error && (<p className="login-page_error">{error}</p>)}

            <Link to="/">Back</Link>

            {currentUser && (<p>Currently logged in as: {currentUser.name}</p>)}

        </section>
    );
}

export default LoginPage;
