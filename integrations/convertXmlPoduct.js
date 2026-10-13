
//Översätter XML > JS

export function mapSupplierXmlProduct(xmlProduct) {
    const variants = xmlProduct.varianter?.variant;

    return {
        artNr: xmlProduct["@_artNr"],
        ean: xmlProduct.ean,
        benamning: xmlProduct.benamning,
        kategori: xmlProduct.kategori,
        pris: xmlProduct.pris?.["#text"] ?? "",
        lagersaldo: xmlProduct.lagersaldo ?? "",
        varianter: Array.isArray(variants)
            ? variants.join("|")
            : variants ?? "",
        uppdaterad: xmlProduct.uppdaterad
    };
}