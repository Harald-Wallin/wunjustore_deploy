import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js"; //createClient skapar ny Supabase client

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || "product-images";

const TIMEOUT_MS = 10_000;

const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

let supabase;

function getStorageClient(){

  //Om 'supabase' redan innehåller en klient:
  if (supabase) {
    return supabase;
  }

  
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error("Supabase Storage is not configured.");
  }

  //Här skapas den faktiska klienten, ingen aning om syntaxen här
  supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    global: {
      fetch: (input, init = {}) =>
        fetch(input, {
          ...init,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        }),
    },
  });

  return supabase;
}

export async function uploadProductImage(sku, image) {
  const extension = EXTENSIONS[image.mimeType];

  //Om formatet inte finns med i EXTENSIONS
  if (!extension) {
    throw new Error("Unsupported image format.");
  }

  //Skapar path för produktens bild t.ex "products/LEV-1001/ff31f381fn.png"
  const path = `products/${sku}/${randomUUID()}.${extension}`;

  //Väljer vår bucket/storage
  const storage = getStorageClient().storage.from(BUCKET);

  const {error} = await storage.upload(path, image.buffer, {
    contentType: image.mimeType,
    upsert: false,
  });

  if (error){
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const {data} = storage.getPublicUrl(path);

  return {path, url: data.publicUrl};
}

export async function removeProductImage(path) {

    //Väljer vår bucket/storage
  const storage = getStorageClient().storage.from(BUCKET);

  //försöker radera filen från supabase, OM DEN MISSLYCKAS "laddas" '{error}' med error-värdet från funktionen.
  //T.ex om resultatet innehåller 'error:null' så blir '{error} = null'.
  const {error} = await storage.remove([path]);

  //så om error innehåller data så throwas detta error
  if (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
}
