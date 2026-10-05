import { Router } from "express";
import { getRates } from "../integrations/currencyAdapter.js";

const router = Router();

//Lite exta säkerhetsuppfång vid "..??"SEK"
router.get("/rates", async (request, response) =>{

    const base = request.query.base ?? "SEK";

    const rates = await getRates(base);

    response.json(rates);
});

export default router;