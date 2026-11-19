import {useCurrency} from "../context/CurrencyContext";

export function currencySelector(){

    const {currency, setCurrency} = useCurrency();

    return(
        <li>
            <select value={currency}
                onChange={(event) => setCurrency(event.target.value)}>
                <option value="SEK">SEK</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
            </select>
        </li>
    );
}