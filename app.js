// ============================================================
// ALMACEN SOCO - CONTROL DE CONOS NFC
// ============================================================

// ------------------------------------------------------------
// VARIABLES GLOBALES
// ------------------------------------------------------------

let currentNfcId = "";
let currentConoData = null;
let nfcReader = null;
let nfcReadingActive = false;


// ------------------------------------------------------------
// ELEMENTOS DEL HTML
// ------------------------------------------------------------

const scanButton = document.getElementById("scanButton");

const statusCard = document.getElementById("statusCard");
const statusText = document.getElementById("statusText");

const resultCard = document.getElementById("resultCard");
const notFoundCard = document.getElementById("notFoundCard");
const errorCard = document.getElementById("errorCard");

const productCode = document.getElementById("productCode");
const productDescription = document.getElementById("productDescription");
const productProvider = document.getElementById("productProvider");
const productColor = document.getElementById("productColor");

const productWeight = document.getElementById("productWeight");
const productTotalStock = document.getElementById("productTotalStock");

const productLocation = document.getElementById("productLocation");
const productStatus = document.getElementById("productStatus");

const nfcCode = document.getElementById("nfcCode");

const notFoundCode = document.getElementById("notFoundCode");

const registerProductButton =
    document.getElementById("registerProductButton");

const registrationCard =
    document.getElementById("registrationCard");

const inputCodigo =
    document.getElementById("inputCodigo");

const inputProducto =
    document.getElementById("inputProducto");

const inputPeso =
    document.getElementById("inputPeso");

const inputUbicacion =
    document.getElementById("inputUbicacion");

const saveRegisterButton =
    document.getElementById("saveRegisterButton");

const cancelRegisterButton =
    document.getElementById("cancelRegisterButton");


// ------------------------------------------------------------
// BOTONES DE ACCIONES
// ------------------------------------------------------------

const entryButton =
    document.getElementById("entryButton");

const exitButton =
    document.getElementById("exitButton");

const historyButton =
    document.getElementById("historyButton");


// ------------------------------------------------------------
// FUNCIONES DE INTERFAZ
// ------------------------------------------------------------

function ocultarTodo() {

    if (statusCard) {
        statusCard.style.display = "none";
    }

    if (resultCard) {
        resultCard.style.display = "none";
    }

    if (notFoundCard) {
        notFoundCard.style.display = "none";
    }

    if (errorCard) {
        errorCard.style.display = "none";
    }

    if (registrationCard) {
        registrationCard.style.display = "none";
    }
}


function mostrarEstado(mensaje) {

    if (!statusCard) return;

    statusCard.style.display = "block";

    if (statusText) {
        statusText.textContent = mensaje;
    }
}


function mostrarError(mensaje) {

    ocultarTodo();

    if (errorCard) {
        errorCard.style.display = "block";

        const errorText =
            errorCard.querySelector("#errorText");

        if (errorText) {
            errorText.textContent = mensaje;
        }
    } else {
        alert(mensaje);
    }
}


function mostrarNoEncontrado(idNfc) {

    ocultarTodo();

    if (notFoundCard) {
        notFoundCard.style.display = "block";
    }

    if (notFoundCode) {
        notFoundCode.textContent = idNfc;
    }
}


function mostrarProducto(data) {

    ocultarTodo();

    currentConoData = data;

    if (resultCard) {
        resultCard.style.display = "block";
    }

    // --------------------------------------------------------
    // DATOS DEL PRODUCTO
    // --------------------------------------------------------

    if (productCode) {
        productCode.textContent =
            data.CODIGO || "—";
    }

    if (productDescription) {
        productDescription.textContent =
            data.DESCRIPCION || "—";
    }

    if (productProvider) {
        productProvider.textContent =
            data.PROVEEDOR || "—";
    }

    if (productColor) {
        productColor.textContent =
            data.COLOR || "—";
    }

    // --------------------------------------------------------
    // PESO DEL CONO
    // --------------------------------------------------------

    if (productWeight) {
        productWeight.textContent =
            formatearPeso(data.PESO_ACTUAL);
    }

    // --------------------------------------------------------
    // STOCK TOTAL DEL PRODUCTO
    // --------------------------------------------------------

    if (productTotalStock) {
        productTotalStock.textContent =
            formatearPeso(data.STOCK_TOTAL);
    }

    // --------------------------------------------------------
    // UBICACIÓN
    // --------------------------------------------------------

    if (productLocation) {
        productLocation.textContent =
            data.UBICACION || "—";
    }

    // --------------------------------------------------------
    // ESTADO
    // --------------------------------------------------------

    if (productStatus) {
        productStatus.textContent =
            data.ESTADO || "—";
    }

    // --------------------------------------------------------
    // ID NFC / CONO
    // --------------------------------------------------------

    if (nfcCode) {
        nfcCode.textContent =
            data.ID_NFC || currentNfcId || "—";
    }
}


function formatearPeso(valor) {

    const numero = Number(valor);

    if (isNaN(numero)) {
        return "0 g";
    }

    return `${numero.toLocaleString("es-PE")} g`;
}


// ------------------------------------------------------------
// CONSULTAR CONO
// ------------------------------------------------------------

async function buscarCono(idNfc) {

    if (!idNfc) {
        mostrarError("No se recibió un ID de NFC.");
        return;
    }

    try {

        mostrarEstado(
            `Buscando cono ${idNfc}...`
        );

        const url =
            `/api/google?action=inventory&id_nfc=${encodeURIComponent(idNfc)}`;

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Error HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        console.log(
            "Respuesta del servidor:",
            data
        );

        if (!data.success) {

            mostrarError(
                data.error ||
                "El servidor devolvió un error."
            );

            return;
        }

        if (!data.found) {

            currentConoData = null;

            mostrarNoEncontrado(idNfc);

            return;
        }

        mostrarProducto(data.data);

    } catch (error) {

        console.error(
            "Error buscando cono:",
            error
        );

        mostrarError(
            "No se pudo conectar con el sistema. " +
            error.message
        );
    }
}


// ------------------------------------------------------------
// INICIAR ESCÁNER NFC
// ------------------------------------------------------------

async function iniciarNFC() {

    if (!("NDEFReader" in window)) {

        mostrarError(
            "Este navegador no admite Web NFC. " +
            "Usa Chrome en tu Samsung Galaxy S21+."
        );

        return;
    }

    try {

        if (!nfcReader) {
            nfcReader = new NDEFReader();
        }

        mostrarEstado(
            "Acerca el cono con NFC al teléfono..."
        );

        scanButton.disabled = true;

        if (!nfcReadingActive) {

            await nfcReader.scan();

            nfcReadingActive = true;

            nfcReader.onreading =
                manejarLecturaNFC;

            nfcReader.onreadingerror =
                manejarErrorNFC;
        }

    } catch (error) {

        console.error(
            "Error iniciando NFC:",
            error
        );

        scanButton.disabled = false;

        mostrarError(
            "No se pudo iniciar NFC. " +
            error.message
        );
    }
}


// ------------------------------------------------------------
// LECTURA NFC
// ------------------------------------------------------------

async function manejarLecturaNFC(event) {

    console.log(
        "NFC detectado:",
        event
    );

    try {

        let contenido = "";

        // ----------------------------------------------------
        // LEER LOS REGISTROS NDEF
        // ----------------------------------------------------

        if (event.message && event.message.records) {

            for (const record of event.message.records) {

                console.log(
                    "Registro NFC:",
                    record
                );

                // --------------------------------------------
                // TEXTO
                // --------------------------------------------

                if (
                    record.recordType === "text" ||
                    record.recordType === "unknown"
                ) {

                    try {

                        const decoder =
                            new TextDecoder(
                                record.encoding || "utf-8"
                            );

                        contenido =
                            decoder.decode(
                                record.data
                            ).trim();

                    } catch (error) {

                        console.warn(
                            "No se pudo leer texto NFC:",
                            error
                        );
                    }
                }

                // --------------------------------------------
                // URL
                // --------------------------------------------

                if (
                    record.recordType === "url"
                ) {

                    try {

                        const decoder =
                            new TextDecoder();

                        contenido =
                            decoder.decode(
                                record.data
                            ).trim();

                    } catch (error) {

                        console.warn(
                            "No se pudo leer URL NFC:",
                            error
                        );
                    }
                }

                if (contenido) {
                    break;
                }
            }
        }

        // ----------------------------------------------------
        // RESULTADO
        // ----------------------------------------------------

        contenido =
            contenido.trim();

        console.log(
            "Contenido NFC:",
            contenido
        );

        // ----------------------------------------------------
        // NFC SIN CONTENIDO
        // ----------------------------------------------------

        if (!contenido) {

            scanButton.disabled = false;

            ocultarTodo();

            if (notFoundCard) {
                notFoundCard.style.display =
                    "block";
            }

            if (notFoundCode) {
                notFoundCode.textContent =
                    "NFC SIN CONTENIDO";
            }

            alert(
                "El NFC está vacío.\n\n" +
                "Este tag todavía no tiene un ID como " +
                "CONO-0001."
            );

            return;
        }

        // ----------------------------------------------------
        // NFC CON ID
        // ----------------------------------------------------

        currentNfcId =
            contenido;

        scanButton.disabled = false;

        await buscarCono(
            currentNfcId
        );

    } catch (error) {

        console.error(
            "Error procesando NFC:",
            error
        );

        scanButton.disabled = false;

        mostrarError(
            "No se pudo procesar el NFC."
        );
    }
}


// ------------------------------------------------------------
// ERROR DE LECTURA NFC
// ------------------------------------------------------------

function manejarErrorNFC(event) {

    console.warn(
        "Error leyendo NFC:",
        event
    );

    scanButton.disabled = false;

    mostrarError(
        "No se pudo leer correctamente el NFC."
    );
}


// ------------------------------------------------------------
// MOSTRAR FORMULARIO DE REGISTRO
// ------------------------------------------------------------

function mostrarRegistroCono() {

    if (!currentNfcId) {

        alert(
            "Primero debes escanear un NFC."
        );

        return;
    }

    ocultarTodo();

    if (registrationCard) {
        registrationCard.style.display =
            "block";
    }

    // ID NFC
    if (inputCodigo) {
        inputCodigo.value =
            currentNfcId;
    }

    // Producto
    if (inputProducto) {
        inputProducto.value = "";
        inputProducto.focus();
    }

    // Peso
    if (inputPeso) {
        inputPeso.value = "";
    }

    // Ubicación
    if (inputUbicacion) {
        inputUbicacion.value = "";
    }
}


// ------------------------------------------------------------
// CANCELAR REGISTRO
// ------------------------------------------------------------

function cancelarRegistro() {

    if (registrationCard) {
        registrationCard.style.display =
            "none";
    }

    if (currentNfcId) {
        buscarCono(currentNfcId);
    } else {
        ocultarTodo();
    }
}


// ------------------------------------------------------------
// GUARDAR NUEVO CONO
// ------------------------------------------------------------

async function guardarCono() {

    const idNfc =
        currentNfcId ||
        (inputCodigo
            ? inputCodigo.value.trim()
            : "");

    const codigo =
        inputProducto
            ? inputProducto.value.trim()
            : "";

    const peso =
        inputPeso
            ? Number(inputPeso.value)
            : 0;

    const ubicacion =
        inputUbicacion
            ? inputUbicacion.value.trim()
            : "";

    // --------------------------------------------------------
    // VALIDACIONES
    // --------------------------------------------------------

    if (!idNfc) {

        alert(
            "Falta el ID del cono."
        );

        return;
    }

    if (!codigo) {

        alert(
            "Ingresa el código del producto."
        );

        if (inputProducto) {
            inputProducto.focus();
        }

        return;
    }

    if (isNaN(peso) || peso < 0) {

        alert(
            "Ingresa un peso válido."
        );

        if (inputPeso) {
            inputPeso.focus();
        }

        return;
    }

    // --------------------------------------------------------
    // DESACTIVAR BOTÓN
    // --------------------------------------------------------

    saveRegisterButton.disabled = true;

    if (saveRegisterButton) {
        saveRegisterButton.textContent =
            "GUARDANDO...";
    }

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

                        action: "createCono",

                        ID_NFC: idNfc,

                        CODIGO: codigo,

                        PESO_ACTUAL: peso,

                        UBICACION: ubicacion,

                        ESTADO: "ACTIVO"
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
            "Respuesta crear cono:",
            data
        );

        if (!data.success) {

            alert(
                data.error ||
                "No se pudo registrar el cono."
            );

            return;
        }

        alert(
            "Cono registrado correctamente."
        );

        currentNfcId =
            idNfc;

        // Buscar nuevamente para obtener
        // todos los datos + stock total

        await buscarCono(
            currentNfcId
        );

    } catch (error) {

        console.error(
            "Error registrando cono:",
            error
        );

        mostrarError(
            "No se pudo registrar el cono. " +
            error.message
        );

    } finally {

        if (saveRegisterButton) {

            saveRegisterButton.disabled =
                false;

            saveRegisterButton.textContent =
                "GUARDAR CONO";
        }
    }
}


// ------------------------------------------------------------
// MOVIMIENTO DE ENTRADA
// ------------------------------------------------------------

async function registrarEntrada() {

    if (!currentNfcId) {

        alert(
            "Primero escanea un cono."
        );

        return;
    }

    const cantidad =
        prompt(
            "¿Cuántos gramos deseas agregar?"
        );

    if (cantidad === null) {
        return;
    }

    const gramos =
        Number(cantidad);

    if (
        isNaN(gramos) ||
        gramos <= 0
    ) {

        alert(
            "Ingresa una cantidad válida."
        );

        return;
    }

    await guardarMovimiento(
        "ENTRADA",
        gramos
    );
}


// ------------------------------------------------------------
// MOVIMIENTO DE SALIDA
// ------------------------------------------------------------

async function registrarSalida() {

    if (!currentNfcId) {

        alert(
            "Primero escanea un cono."
        );

        return;
    }

    const cantidad =
        prompt(
            "¿Cuántos gramos deseas retirar?"
        );

    if (cantidad === null) {
        return;
    }

    const gramos =
        Number(cantidad);

    if (
        isNaN(gramos) ||
        gramos <= 0
    ) {

        alert(
            "Ingresa una cantidad válida."
        );

        return;
    }

    await guardarMovimiento(
        "SALIDA",
        gramos
    );
}


// ------------------------------------------------------------
// GUARDAR MOVIMIENTO
// ------------------------------------------------------------

async function guardarMovimiento(
    tipo,
    cantidad
) {

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

                        action: "saveMovement",

                        ID_NFC:
                            currentNfcId,

                        TIPO:
                            tipo,

                        CANTIDAD_G:
                            cantidad,

                        OBSERVACION:
                            ""
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
            "Movimiento:",
            data
        );

        if (!data.success) {

            alert(
                data.error ||
                "No se pudo registrar el movimiento."
            );

            return;
        }

        alert(
            `Movimiento ${tipo.toLowerCase()} registrado.`
        );

        // Volver a consultar el cono
        // para actualizar peso y stock

        await buscarCono(
            currentNfcId
        );

    } catch (error) {

        console.error(
            "Error guardando movimiento:",
            error
        );

        alert(
            "No se pudo registrar el movimiento.\n\n" +
            error.message
        );
    }
}


// ------------------------------------------------------------
// HISTORIAL
// ------------------------------------------------------------

async function mostrarHistorial() {

    if (!currentNfcId) {

        alert(
            "Primero escanea un cono."
        );

        return;
    }

    try {

        const url =
            `/api/google?action=movements&id_nfc=${encodeURIComponent(currentNfcId)}`;

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Error HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        console.log(
            "Historial:",
            data
        );

        if (!data.success) {

            alert(
                data.error ||
                "No se pudo obtener el historial."
            );

            return;
        }

        const movimientos =
            data.data || [];

        if (movimientos.length === 0) {

            alert(
                "Este cono todavía no tiene movimientos."
            );

            return;
        }

        let texto =
            `HISTORIAL - ${currentNfcId}\n\n`;

        movimientos
            .slice()
            .reverse()
            .forEach(
                (movimiento, index) => {

                    let fecha = "";

                    if (
                        movimiento.FECHA
                    ) {

                        fecha =
                            new Date(
                                movimiento.FECHA
                            ).toLocaleString(
                                "es-PE"
                            );
                    }

                    texto +=
                        `${index + 1}. ` +
                        `${movimiento.TIPO} ` +
                        `${movimiento.CANTIDAD_G} g\n`;

                    texto +=
                        `${fecha}\n`;

                    texto +=
                        `${movimiento.PESO_ANTERIOR} g → ` +
                        `${movimiento.PESO_NUEVO} g\n\n`;
                }
            );

        alert(texto);

    } catch (error) {

        console.error(
            "Error obteniendo historial:",
            error
        );

        alert(
            "No se pudo obtener el historial.\n\n" +
            error.message
        );
    }
}


// ------------------------------------------------------------
// EVENTOS
// ------------------------------------------------------------

if (scanButton) {

    scanButton.addEventListener(
        "click",
        iniciarNFC
    );
}


if (registerProductButton) {

    registerProductButton.addEventListener(
        "click",
        mostrarRegistroCono
    );
}


if (cancelRegisterButton) {

    cancelRegisterButton.addEventListener(
        "click",
        cancelarRegistro
    );
}


if (saveRegisterButton) {

    saveRegisterButton.addEventListener(
        "click",
        guardarCono
    );
}


if (entryButton) {

    entryButton.addEventListener(
        "click",
        registrarEntrada
    );
}


if (exitButton) {

    exitButton.addEventListener(
        "click",
        registrarSalida
    );
}


if (historyButton) {

    historyButton.addEventListener(
        "click",
        mostrarHistorial
    );
}


// ------------------------------------------------------------
// INICIO
// ------------------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    () => {

        ocultarTodo();

        console.log(
            "Almacén SOCO iniciado."
        );

        console.log(
            "NFC disponible:",
            "NDEFReader" in window
        );
    }
);