import {fetchWithRetry} from "./fetchWithRetry.js";

export async function fetchJson(url, options = {}){
    const response = await fetchWithRetry(url,options);

    return response.json();
};