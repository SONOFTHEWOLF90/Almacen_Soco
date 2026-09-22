const scanButton = document.getElementById("scanButton");

const statusBox = document.getElementById("status");
const statusText = document.getElementById("statusText");

const resultCard = document.getElementById("resultCard");
const notFoundCard = document.getElementById("notFoundCard");
const errorCard = document.getElementById("errorCard");

const productCode = document.getElementById("productCode");
const productDescription =
    document.getElementById("productDescription");

const productProvider =
    document.getElementById("productProvider");

const productColor =
    document.getElementById("productColor");

const productWeight =
    document.getElementById("productWeight");

const productLocation =
    document.getElementById("productLocation");

const productStatus =
    document.getElementById("productStatus");

const nfcCode =
    document.getElementById("nfcCode");

const notFoundCode =
    document.getElementById("notFoundCode");

const errorText =
    document.getElementById("errorText");


// ======================================================
// FORMULARIO
// ======================================================

const registerCard =
    document.getElementById("registerCard");

const registerProductButton =
    document.getElementById("registerProductButton");

const inputCodigo =
    document.getElementById("inputCodigo");

const inputDescripcion =
    document.getElementById("inputDescripcion");

const inputProveedor =
    document.getElementById("inputProveedor");

const inputColor =
    document.getElementById("inputColor");

const inputPeso =
    document.getElementById("inputPeso");

const inputUbicacion =
    document.getElementById("inputUbicacion");

const saveRegisterButton =
    document.getElementById("saveRegisterButton");

const cancelRegisterButton =
    document.getElementById("cancelRegisterButton");

const registerStatus =
    document.getElementById("registerStatus");

const registerStatusText =
    document.getElementById("registerStatusText");


// ======================================================
// VARIABLES
// ======================================================

let currentCode = "";


// ======================================================
// ESTADO
// ======================================================

function setStatus(type, message) {

    statusBox.className = "status " + type;

    statusText.textContent = message;

}


// ======================================================
// ERROR
// ======================================================

function showError(message) {

    errorCard.classList.remove("hidden");

    resultCard.classList.add("hidden");

    notFoundCard.classList.add("hidden");

    errorText.textContent = message;

    setStatus("error", "Error");

}


function hideError() {

    errorCard.classList.add("hidden");

}


// ======================================================
// OCULTAR PANTALLAS
// ======================================================

function hideAllResults() {

    resultCard.classList.add("hidden");

    notFoundCard.classList.add("hidden");

    registerCard.classList.add("hidden");

}


// ======================================================
// DECODIFICAR NFC
// ======================================================

function decodeRecord(record) {

    try {

        const decoder =
            new TextDecoder(
                record.encoding || "utf-8"
            );

        return decoder.decode(record.data);

    }

    catch (error) {

        return "";

    }

}


// ======================================================
// LEER NDEF
// ======================================================

function parseNdefMessage(message) {

    let content = "";

    for (const record of message.records) {

        content += decodeRecord(record);

    }

    return content.trim();

}


// ======================================================
// BUSCAR PRODUCTO
// ======================================================

async function buscarProducto(codigo) {

    const url =
        `/api/google?action=inventory&id_nfc=${encodeURIComponent(codigo)}`;

    const response =
        await fetch(url);

    if (!response.ok) {

        throw new Error(
            `Error HTTP ${response.status}`
        );

    }

    return await response.json();

}


// ======================================================
// MOSTRAR PRODUCTO
// ======================================================

function mostrarProducto(data, codigo) {

    if (!data.found || !data.data) {

        mostrarProductoNoEncontrado(codigo);

        return;

    }


    const item = data.data;


    resultCard.classList.remove("hidden");

    notFoundCard.classList.add("hidden");


    productCode.textContent =
        item.CODIGO || codigo;


    productDescription.textContent =
        item.DESCRIPCION || "-";


    productProvider.textContent =
        item.PROVEEDOR || "-";


    productColor.textContent =
        item.COLOR || "-";


    productWeight.textContent =
        `${item.PESO_ACTUAL || 0} g`;


    productLocation.textContent =
        item.UBICACION || "-";


    productStatus.textContent =
        item.ESTADO || "-";


    nfcCode.textContent =
        codigo;


    setStatus(
        "success",
        "Producto encontrado"
    );

}


// ======================================================
// PRODUCTO NO ENCONTRADO
// ======================================================

function mostrarProductoNoEncontrado(codigo) {

    resultCard.classList.add("hidden");

    notFoundCard.classList.remove("hidden");


    notFoundCode.textContent =
        codigo;


    setStatus(
        "success",
        "Producto no registrado"
    );

}


// ======================================================
// ABRIR REGISTRO
// ======================================================

function abrirRegistro() {

    inputCodigo.value =
        currentCode;


    inputDescripcion.value = "";

    inputProveedor.value = "";

    inputColor.value = "";

    inputPeso.value = "";

    inputUbicacion.value = "";


    registerStatus.classList.add(
        "hidden"
    );


    registerCard.classList.remove(
        "hidden"
    );


    registerCard.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    setTimeout(() => {

        inputDescripcion.focus();

    }, 400);

}


// ======================================================
// CANCELAR REGISTRO
// ======================================================

function cancelarRegistro() {

    registerCard.classList.add(
        "hidden"
    );

}


// ======================================================
// GUARDAR PRODUCTO
// ======================================================

async function guardarProducto() {

    const codigo =
        inputCodigo.value.trim();

    const descripcion =
        inputDescripcion.value.trim();

    const proveedor =
        inputProveedor.value.trim();

    const color =
        inputColor.value.trim();

    const peso =
        inputPeso.value.trim();

    const ubicacion =
        inputUbicacion.value.trim();


    if (!codigo) {

        mostrarEstadoRegistro(
            "error",
            "No se encontró el código del NFC."
        );

        return;

    }


    if (!descripcion) {

        mostrarEstadoRegistro(
            "error",
            "Ingresa la descripción."
        );

        return;

    }


    if (!peso) {

        mostrarEstadoRegistro(
            "error",
            "Ingresa el peso inicial."
        );

        return;

    }


    if (Number(peso) < 0) {

        mostrarEstadoRegistro(
            "error",
            "El peso no puede ser negativo."
        );

        return;

    }


    saveRegisterButton.disabled = true;


    mostrarEstadoRegistro(
        "reading",
        "Guardando producto..."
    );


    try {

        const response =
            await fetch(
                "/api/google",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        action:
                            "createInventory",

                        ID_NFC:
                            codigo,

                        CODIGO:
                            codigo,

                        DESCRIPCION:
                            descripcion,

                        PROVEEDOR:
                            proveedor,

                        COLOR:
                            color,

                        PESO_INICIAL:
                            Number(peso),

                        UBICACION:
                            ubicacion

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                `Error HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Respuesta:",
            data
        );


        if (!data.success) {

            throw new Error(
                data.error ||
                "No se pudo registrar el producto."
            );

        }


        mostrarEstadoRegistro(
            "success",
            "Producto registrado correctamente."
        );


        // Mostrar directamente el producto

        resultCard.classList.remove(
            "hidden"
        );

        notFoundCard.classList.add(
            "hidden"
        );


        productCode.textContent =
            codigo;

        productDescription.textContent =
            descripcion;

        productProvider.textContent =
            proveedor || "-";

        productColor.textContent =
            color || "-";

        productWeight.textContent =
            `${Number(peso)} g`;

        productLocation.textContent =
            ubicacion || "-";

        productStatus.textContent =
            "ACTIVO";

        nfcCode.textContent =
            codigo;


        setStatus(
            "success",
            "Producto registrado correctamente"
        );


        setTimeout(() => {

            registerCard.classList.add(
                "hidden"
            );

        }, 1500);


    }

    catch (error) {

        console.error(error);


        mostrarEstadoRegistro(
            "error",
            error.message
        );

    }


    finally {

        saveRegisterButton.disabled =
            false;

    }

}


// ======================================================
// ESTADO DEL REGISTRO
// ======================================================

function mostrarEstadoRegistro(
    type,
    message
) {

    registerStatus.className =
        "status " + type;

    registerStatusText.textContent =
        message;

    registerStatus.classList.remove(
        "hidden"
    );

}


// ======================================================
// ESCANEAR NFC
// ======================================================

async function scanNFC() {

    hideError();

    hideAllResults();


    if (!("NDEFReader" in window)) {

        showError(
            "Este navegador no permite Web NFC. " +
            "Utiliza Google Chrome en Android."
        );

        return;

    }


    try {

        scanButton.disabled =
            true;


        setStatus(
            "reading",
            "Acerca el teléfono al NFC..."
        );


        const ndef =
            new NDEFReader();


        await ndef.scan();


        // ==================================================
        // ERROR NFC
        // ==================================================

        ndef.addEventListener(
            "readingerror",
            () => {

                showError(
                    "No se pudo leer el NFC. " +
                    "Acerca nuevamente el teléfono."
                );

                scanButton.disabled =
                    false;

            }
        );


        // ==================================================
        // NFC LEÍDO
        // ==================================================

        ndef.addEventListener(
            "reading",
            async ({
                message,
                serialNumber
            }) => {

                console.log(
                    "Serial NFC:",
                    serialNumber
                );


                const content =
                    parseNdefMessage(message);


                /*
                 * EL CONTENIDO DEL NFC ES EL CÓDIGO
                 *
                 * Ejemplo:
                 *
                 * 202
                 *
                 * 204
                 *
                 * 100hc22803
                 *
                 * 1-424 CONO
                 */


                const codigo =
                    content ||
                    serialNumber ||
                    "";


                if (!codigo) {

                    showError(
                        "El NFC no contiene un código."
                    );

                    scanButton.disabled =
                        false;

                    return;

                }


                currentCode =
                    codigo;


                console.log(
                    "Código del producto:",
                    codigo
                );


                try {

                    setStatus(
                        "reading",
                        "Consultando inventario..."
                    );


                    const data =
                        await buscarProducto(
                            codigo
                        );


                    mostrarProducto(
                        data,
                        codigo
                    );

                }

                catch (error) {

                    console.error(error);


                    showError(
                        "El NFC fue leído, " +
                        "pero no se pudo consultar " +
                        "el inventario."
                    );

                }


                scanButton.disabled =
                    false;

            }
        );


    }

    catch (error) {

        console.error(error);


        scanButton.disabled =
            false;


        if (
            error.name ===
            "NotAllowedError"
        ) {

            showError(
                "El navegador no tiene permiso para utilizar NFC."
            );

        }

        else if (
            error.name ===
            "NotSupportedError"
        ) {

            showError(
                "Este dispositivo no soporta Web NFC."
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
// EVENTOS
// ======================================================

scanButton.addEventListener(
    "click",
    scanNFC
);


registerProductButton.addEventListener(
    "click",
    abrirRegistro
);


cancelRegisterButton.addEventListener(
    "click",
    cancelarRegistro
);


saveRegisterButton.addEventListener(
    "click",
    guardarProducto
);