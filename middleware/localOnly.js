export function localOnly(req, res, next) {

    if (process.env.NODE_ENV !== "development") {
        return res.status(403).json({
            error: "Admin operations are disabled."
        });
    }

    next();
}