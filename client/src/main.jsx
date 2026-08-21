import {StrictMode} from "react";
import { createRoot } from "react-dom/client";
import {BrowserRouter} from "react-router-dom";

import App from "./App";
import {CartProvider} from "./context/CartContext";
import "./index.css";

//<BrowserRouter och CartProvider omsluter här <App> och gör så att den kan använda routingfunktioner
//samt har tillgång till CartProvider-contexten
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>
);
