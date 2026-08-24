import {StrictMode} from "react";
import { createRoot } from "react-dom/client";
import {BrowserRouter} from "react-router-dom";

import App from "./App";
import {CartProvider} from "./context/CartContext";
import "./index.css";

//<BrowserRouter och context-providers'erna omsluter här <App> och gör så att den kan använda routingfunktioner
//samt har tillgång till Provider-contexten.
//PS. <Cart innanför <User för att cart förmodligen behöver veta UserState?
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);
