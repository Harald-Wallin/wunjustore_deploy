//Denna förstår jag inte helt, fråga Sibbe?
//Implementerar iallafall en delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Kollar om status innehåller något av dessa nummer, returnerar boolean
function shouldRetry(status) {
    return [408, 429, 500, 502, 503, 504].includes(status);
}

export async function fetchJson(url, { headers = {}, timeoutMs = 5000, retries = 2} = {}){


    for (let attempt = 0; attempt <= retries; attempt++){

        let response;

        try{
            //1.Här vill vi bara ha en giltig response- t.ex 200 eller 500 spelar ingen roll -
            //det är en giltig kod

            //PS. fetch kan kasta egna fel, inuti try/catch hamnar det automatiskt i (error)
            response = await fetch(url, {headers, signal: AbortSignal.timeout(timeoutMs)});

        }catch(error){// OBS - VÄRDET SOM KASTAS I TRY HAMNAR AUTOMATISKT I CATCH
        //2.INGEN respons (t.ex nätverksfel eller timeout)

            if (attempt < retries){

                const delay = 500 * (2 ** attempt);

                console.log(`Network error- Retry ${attempt + 1}/${retries} in ${delay} ms`);

                await sleep (delay);
                continue;
            }
            

            //OM inga försök kvar..

            //"om 'error' är ett Error-objekt OCH..." > throw new error. 
            //"TimeoutError" är ett inbyggt error-namn
            if (error instanceof Error && error.name === "TimeoutError"){

                throw new Error(`No response from ${url} within ${timeoutMs} ms (timeout)`);
            };

            //"cause" sparar det ursprungliga error'et- det kan innehålla värdefull info
            throw new Error(`Could not reach ${url} (network error)`, {cause:error});
        };


        //2.FÅR respons men HTTP-fel

        //Om vi får giltig respons MEN t.ex en felkod/status
        if (!response.ok){

            if (shouldRetry(response.status) && attempt < retries){
                const delay = 500 * (2 ** attempt);

                console.log(`HTTP ${response.status}. Retry ${attempt + 1}/${retries} in ${delay}`);
                await sleep(delay);
                
                continue;
            }

            throw new Error(`${url} responded with status ${response.status} ${response.statusText}`);
        };

        //3. dålig data > ZOD ska upptäcka detta
        return response.json();

        // 1xx = information
        // 2xx = Success
        // 3xx = Redirect
        // 4xx = Klient/request-problem
        // 5xx = Servern har problem

    };
}
