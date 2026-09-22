const scanButton = document.getElementById("scanButton");

const statusBox = document.getElementById("status");
const statusText = document.getElementById("statusText");

const resultCard = document.getElementById("resultCard");
const errorCard = document.getElementById("errorCard");

const nfcCode = document.getElementById("nfcCode");
const nfcContent = document.getElementById("nfcContent");
const nfcType = document.getElementById("nfcType");

const errorText = document.getElementById("errorText");


// ======================================================
// ESTADO
// ======================================================

function setStatus(type, message) {

    statusBox.className = "status " + type;
    statusText.textContent = message;

}


// ======================================================
// ERRORES
// ======================================================

function showError(message) {

    errorCard.classList.remove("hidden");
    resultCard.classList.add("hidden");

    errorText.textContent = message;

    setStatus("error", "Error");

}


function hideError() {

    errorCard.classList.add("hidden");

}


// ======================================================
// RESULTADO
// ======================================================

function hideResult() {

    resultCard.classList.add("hidden");

}


function showResult(code, content, type) {

    hideError();

    resultCard.classList.remove("hidden");

    nfcCode.textContent = code;
    nfcContent.textContent = content;
    nfcType.textContent = type;

}


// ======================================================
// LEER TEXTO DEL NFC
// ======================================================

function decodeRecord(record) {

    try {

        const decoder = new TextDecoder(
            record.encoding || "utf-8"
        );

        return decoder.decode(record.data);

    } catch (error) {

        return "[Datos no legibles como texto]";

    }

}


// ======================================================
// LEER MENSAJE NDEF
// ======================================================

function parseNdefMessage(message) {

    let content = "";

    for (const record of message.records) {

        if (record.recordType === "text") {

            content += decodeRecord(record);

        }

        else if (record.recordType === "url") {

            content += decodeRecord(record);

        }

        else {

            content += decodeRecord(record);

        }

    }

    return content.trim();

}


// ======================================================
// BUSCAR NFC EN GOOGLE SHEETS
// ======================================================

async function buscarInventario(idNfc) {

    try {

        setStatus(
            "reading",
            "Buscando el cono en el inventario..."
        );

        const url =
            `/api/google?action=inventory&id_nfc=${encodeURIComponent(idNfc)}`;

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Error HTTP ${response.status}`
            );

        }

        const data = await response.json();

        console.log("Respuesta inventario:", data);

        return data;

    }

    catch (error) {

        console.error(
            "Error buscando inventario:",
            error
        );

        throw error;

    }

}


// ======================================================
// MOSTRAR INVENTARIO
// ======================================================

function mostrarInventario(data, codigoNfc) {

    if (!data.found || !data.data) {

        showResult(
            codigoNfc,
            "Este NFC todavía no está registrado en el inventario.",
            "NTAG / NO REGISTRADO"
        );

        setStatus(
            "success",
            "NFC leído - cono no registrado"
        );

        return;

    }


    const item = data.data;

    const informacion = [

        `Código: ${item.CODIGO || "-"}`,

        `Descripción: ${item.DESCRIPCION || "-"}`,

        `Proveedor: ${item.PROVEEDOR || "-"}`,

        `Color: ${item.COLOR || "-"}`,

        `Peso inicial: ${item.PESO_INICIAL || "-"} g`,

        `Peso actual: ${item.PESO_ACTUAL || "-"} g`,

        `Ubicación: ${item.UBICACION || "-"}`,

        `Estado: ${item.ESTADO || "-"}`

    ].join("\n");


    showResult(
        codigoNfc,
        informacion,
        "NTAG / INVENTARIO"
    );


    setStatus(
        "success",
        "Cono encontrado en inventario"
    );

}


// ======================================================
// ESCANEAR NFC
// ======================================================

async function scanNFC() {

    hideError();
    hideResult();


    // ------------------------------------------
    // COMPROBAR WEB NFC
    // ------------------------------------------

    if (!("NDEFReader" in window)) {

        showError(
            "Este navegador no permite Web NFC. " +
            "Prueba con Google Chrome en Android. " +
            "También verifica que NFC esté activado."
        );

        return;

    }


    try {

        scanButton.disabled = true;


        setStatus(
            "reading",
            "Acerca el teléfono al NTAG215..."
        );


        const ndef = new NDEFReader();


        await ndef.scan();


        // ------------------------------------------
        // ERROR DE LECTURA
        // ------------------------------------------

        ndef.addEventListener(
            "readingerror",
            () => {

                showError(
                    "No se pudo leer el NFC. " +
                    "Acerca nuevamente el teléfono al chip."
                );

                scanButton.disabled = false;

            }
        );


        // ------------------------------------------
        // NFC DETECTADO
        // ------------------------------------------

        ndef.addEventListener(
            "reading",
            async ({ message, serialNumber }) => {

                console.log(
                    "NFC detectado:",
                    serialNumber
                );


                // ------------------------------------------
                // OBTENER CONTENIDO NDEF
                // ------------------------------------------

                const content =
                    parseNdefMessage(message);


                /*
                 * Nuestro NTAG215 actualmente contiene:
                 *
                 * RR1000118092026 Varios Michell
                 *
                 * Utilizamos ese contenido como ID_NFC.
                 */

                const code =
                    content ||
                    serialNumber ||
                    "SIN CÓDIGO";


                console.log(
                    "ID NFC:",
                    code
                );


                // ------------------------------------------
                // BUSCAR EN GOOGLE SHEETS
                // ------------------------------------------

                try {

                    const data =
                        await buscarInventario(code);


                    mostrarInventario(
                        data,
                        code
                    );


                }

                catch (error) {

                    showError(
                        "El NFC se leyó correctamente, " +
                        "pero no se pudo consultar el inventario."
                    );

                }


                scanButton.disabled = false;

            }
        );


    }

    catch (error) {

        console.error(error);

        scanButton.disabled = false;


        if (error.name === "NotAllowedError") {

            showError(
                "El navegador no tiene permiso " +
                "para utilizar NFC."
            );

        }

        else if (error.name === "NotSupportedError") {

            showError(
                "Este dispositivo o navegador " +
                "no soporta Web NFC."
            );

        }

        else {

            showError(
                "Error NFC: " +
                error.message
            );

        }

    }

}


// ======================================================
// BOTÓN
// ======================================================

scanButton.addEventListener(
    "click",
    scanNFC
);