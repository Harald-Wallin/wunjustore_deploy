
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next){

    //hämtar token
    const token = req.cookies?.access_token;

    if (!token) {
        return res.status(401).json({
            message: "Not authenticated"
        });
    }

    try {

        //verifierar token via inbyggt jwt.verify
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        //användarID från verifierad JWT läggs till i req-objektet
        req.userId = payload.sub;

        //next, för att detta ska användas som en middleware
        next();

    } catch{

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}
