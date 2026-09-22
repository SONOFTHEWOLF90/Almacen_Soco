const scanButton = document.getElementById("scanButton");

const statusBox = document.getElementById("status");
const statusText = document.getElementById("statusText");

const resultCard = document.getElementById("resultCard");
const errorCard = document.getElementById("errorCard");

const nfcCode = document.getElementById("nfcCode");
const nfcContent = document.getElementById("nfcContent");
const nfcType = document.getElementById("nfcType");

const errorText = document.getElementById("errorText");


function setStatus(type, message) {

    statusBox.className = "status " + type;

    statusText.textContent = message;
}


function showError(message) {

    errorCard.classList.remove("hidden");

    resultCard.classList.add("hidden");

    errorText.textContent = message;

    setStatus("error", "Error");
}


function hideError() {

    errorCard.classList.add("hidden");

}


function hideResult() {

    resultCard.classList.add("hidden");

}


function showResult(code, content, type) {

    hideError();

    resultCard.classList.remove("hidden");

    nfcCode.textContent = code;
    nfcContent.textContent = content;
    nfcType.textContent = type;

    setStatus("success", "NFC leído correctamente");

}


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


async function scanNFC() {

    hideError();
    hideResult();

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


        ndef.addEventListener(
            "reading",
            ({ message, serialNumber }) => {

                console.log(
                    "NFC detectado:",
                    serialNumber
                );

                const content =
                    parseNdefMessage(message);


                /*
                 * Si el NFC contiene algo como:
                 *
                 * BL100
                 *
                 * utilizamos ese contenido como código.
                 */

                const code =
                    content || serialNumber || "SIN CÓDIGO";


                showResult(
                    code,
                    content || "Sin contenido NDEF",
                    "NTAG / NDEF"
                );


                scanButton.disabled = false;

            }
        );


    } catch (error) {

        console.error(error);

        scanButton.disabled = false;


        if (error.name === "NotAllowedError") {

            showError(
                "El navegador no tiene permiso para utilizar NFC."
            );

        }

        else if (error.name === "NotSupportedError") {

            showError(
                "Este dispositivo o navegador no soporta Web NFC."
            );

        }

        else {

            showError(
                "Error NFC: " + error.message
            );

        }

    }

}


scanButton.addEventListener(
    "click",
    scanNFC
);