export function normalizeSupplierProduct(rawProduct){

    //normaliserar dataformatet till det interna i detta projekt
    return {
        sku: rawProduct.artNr,
        ean: rawProduct.ean,
        name: rawProduct.benamning,
        category: rawProduct.kategori,

        //JS förväntar sig ".", inte ","
        price: Number(rawProduct.pris.replace(",", ".")), 

        //Om tomt = 0, annars Number
        stock: rawProduct.lagersaldo === "" ? 0 : Number(rawProduct.lagersaldo),

        //Om det finns varianter, dela dem vid |- symbolerna, annars tom array
        variants: rawProduct.varianter
            ? rawProduct.varianter.split("|")
            : [],

        updatedAt: rawProduct.uppdaterad
    };
}