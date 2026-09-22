// ============================================================
// ALMACEN SOCO - CONTROL DE CONOS NFC
// ============================================================

let currentNfcId = "";
let currentConoData = null;

let nfcReader = null;
let nfcReadingActive = false;

let currentTagIsBlank = false;


// ============================================================
// ELEMENTOS HTML
// ============================================================

const scanButton =
    document.getElementById("scanButton");

const statusCard =
    document.getElementById("statusCard");

const statusText =
    document.getElementById("statusText");

const resultCard =
    document.getElementById("resultCard");

const notFoundCard =
    document.getElementById("notFoundCard");

const errorCard =
    document.getElementById("errorCard");

const productCode =
    document.getElementById("productCode");

const productDescription =
    document.getElementById("productDescription");

const productProvider =
    document.getElementById("productProvider");

const productColor =
    document.getElementById("productColor");

const productWeight =
    document.getElementById("productWeight");

const productTotalStock =
    document.getElementById("productTotalStock");

const productLocation =
    document.getElementById("productLocation");

const productStatus =
    document.getElementById("productStatus");

const nfcCode =
    document.getElementById("nfcCode");

const notFoundCode =
    document.getElementById("notFoundCode");

const registerProductButton =
    document.getElementById(
        "registerProductButton"
    );

const registrationCard =
    document.getElementById(
        "registrationCard"
    );

const inputCodigo =
    document.getElementById(
        "inputCodigo"
    );

const inputProducto =
    document.getElementById(
        "inputProducto"
    );

const inputPeso =
    document.getElementById(
        "inputPeso"
    );

const inputUbicacion =
    document.getElementById(
        "inputUbicacion"
    );

const saveRegisterButton =
    document.getElementById(
        "saveRegisterButton"
    );

const cancelRegisterButton =
    document.getElementById(
        "cancelRegisterButton"
    );

const entryButton =
    document.getElementById(
        "entryButton"
    );

const exitButton =
    document.getElementById(
        "exitButton"
    );

const historyButton =
    document.getElementById(
        "historyButton"
    );


// ============================================================
// INTERFAZ
// ============================================================

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

    if (statusCard) {
        statusCard.style.display = "block";
    }

    if (statusText) {
        statusText.textContent = mensaje;
    }
}


function mostrarError(mensaje) {

    ocultarTodo();

    if (errorCard) {

        errorCard.style.display =
            "block";

        const errorText =
            errorCard.querySelector(
                "#errorText"
            );

        if (errorText) {
            errorText.textContent =
                mensaje;
        }

    } else {

        alert(mensaje);
    }
}


function formatearPeso(valor) {

    const numero =
        Number(valor);

    if (isNaN(numero)) {
        return "0 g";
    }

    return (
        numero.toLocaleString("es-PE") +
        " g"
    );
}


// ============================================================
// MOSTRAR CONO NO REGISTRADO
// ============================================================

function mostrarNoEncontrado(idNfc) {

    ocultarTodo();

    if (notFoundCard) {
        notFoundCard.style.display =
            "block";
    }

    if (notFoundCode) {
        notFoundCode.textContent =
            idNfc;
    }
}


// ============================================================
// MOSTRAR PRODUCTO
// ============================================================

function mostrarProducto(data) {

    ocultarTodo();

    currentConoData =
        data;

    if (resultCard) {
        resultCard.style.display =
            "block";
    }

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

    if (productWeight) {
        productWeight.textContent =
            formatearPeso(
                data.PESO_ACTUAL
            );
    }

    if (productTotalStock) {
        productTotalStock.textContent =
            formatearPeso(
                data.STOCK_TOTAL
            );
    }

    if (productLocation) {
        productLocation.textContent =
            data.UBICACION || "—";
    }

    if (productStatus) {
        productStatus.textContent =
            data.ESTADO || "—";
    }

    if (nfcCode) {
        nfcCode.textContent =
            data.ID_NFC ||
            currentNfcId ||
            "—";
    }
}


// ============================================================
// BUSCAR CONO EN GOOGLE SHEETS
// ============================================================

async function buscarCono(idNfc) {

    if (!idNfc) {

        mostrarError(
            "No se recibió un ID de NFC."
        );

        return;
    }

    try {

        mostrarEstado(
            "Buscando cono " +
            idNfc +
            "..."
        );

        const url =
            "/api/google?action=inventory&id_nfc=" +
            encodeURIComponent(idNfc);

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                "Error HTTP " +
                response.status
            );
        }

        const data =
            await response.json();

        console.log(
            "Respuesta inventario:",
            data
        );

        if (!data.success) {

            mostrarError(
                data.error ||
                "Error del servidor."
            );

            return;
        }

        if (!data.found) {

            currentConoData =
                null;

            mostrarNoEncontrado(
                idNfc
            );

            return;
        }

        currentNfcId =
            data.data.ID_NFC;

        currentTagIsBlank =
            false;

        mostrarProducto(
            data.data
        );

    } catch (error) {

        console.error(
            "Error buscando cono:",
            error
        );

        mostrarError(
            "No se pudo consultar el sistema.\n\n" +
            error.message
        );
    }
}


// ============================================================
// OBTENER SIGUIENTE ID
// ============================================================

async function obtenerSiguienteConoId() {

    try {

        mostrarEstado(
            "Consultando siguiente ID..."
        );

        const url =
            "/api/google?action=nextConoId&t=" +
            Date.now();

        const response =
            await fetch(url, {
                method: "GET",
                cache: "no-store"
            });

        console.log(
            "Estado nextConoId:",
            response.status
        );

        if (!response.ok) {

            throw new Error(
                "Error HTTP " +
                response.status
            );
        }

        const texto =
            await response.text();

        console.log(
            "Respuesta nextConoId:",
            texto
        );

        let data;

        try {

            data =
                JSON.parse(texto);

        } catch (error) {

            throw new Error(
                "El servidor no devolvió JSON válido: " +
                texto
            );
        }

        if (
            !data.success ||
            !data.id_nfc
        ) {

            throw new Error(
                data.error ||
                "No se pudo generar el ID del cono."
            );
        }

        console.log(
            "ID generado:",
            data.id_nfc
        );

        return data.id_nfc;

    } catch (error) {

        console.error(
            "Error obteniendo ID del cono:",
            error
        );

        throw error;
    }
}


// ============================================================
// INICIAR NFC
// ============================================================

async function iniciarNFC() {

    if (!("NDEFReader" in window)) {

        mostrarError(
            "Este navegador no admite Web NFC.\n\n" +
            "Usa Chrome en tu Samsung Galaxy S21+."
        );

        return;
    }

    try {

        if (!nfcReader) {

            nfcReader =
                new NDEFReader();
        }

        mostrarEstado(
            "Acerca el NFC del cono al teléfono..."
        );

        scanButton.disabled =
            true;

        if (!nfcReadingActive) {

            await nfcReader.scan();

            nfcReadingActive =
                true;

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

        scanButton.disabled =
            false;

        mostrarError(
            "No se pudo iniciar NFC.\n\n" +
            error.message
        );
    }
}


// ============================================================
// LEER NFC
// ============================================================

async function manejarLecturaNFC(event) {

    console.log(
        "NFC detectado:",
        event
    );

    try {

        let contenido = "";


        // ----------------------------------------------------
        // LEER CONTENIDO NDEF
        // ----------------------------------------------------

        if (
            event.message &&
            event.message.records
        ) {

            for (
                const record
                of event.message.records
            ) {

                console.log(
                    "Registro:",
                    record
                );


                // --------------------------------------------
                // TEXTO
                // --------------------------------------------

                if (
                    record.recordType ===
                        "text"
                ) {

                    try {

                        const decoder =
                            new TextDecoder(
                                "utf-8"
                            );

                        contenido =
                            decoder
                                .decode(
                                    record.data
                                )
                                .trim();

                    } catch (error) {

                        console.warn(
                            "Error leyendo texto:",
                            error
                        );
                    }
                }


                // --------------------------------------------
                // URL
                // --------------------------------------------

                else if (
                    record.recordType ===
                        "url"
                ) {

                    try {

                        const decoder =
                            new TextDecoder(
                                "utf-8"
                            );

                        contenido =
                            decoder
                                .decode(
                                    record.data
                                )
                                .trim();

                    } catch (error) {

                        console.warn(
                            "Error leyendo URL:",
                            error
                        );
                    }
                }


                if (contenido) {
                    break;
                }
            }
        }


        contenido =
            contenido.trim();


        console.log(
            "Contenido NFC:",
            contenido
        );


        // ====================================================
        // NFC VACÍO
        // ====================================================

        if (!contenido) {

            currentNfcId =
                "";

            currentConoData =
                null;

            currentTagIsBlank =
                true;

            scanButton.disabled =
                false;

            ocultarTodo();


            if (notFoundCard) {

                notFoundCard.style.display =
                    "block";
            }


            if (notFoundCode) {

                notFoundCode.textContent =
                    "NFC VACÍO";
            }


            return;
        }


        // ====================================================
        // NFC CON ID
        // ====================================================

        currentNfcId =
            contenido;

        currentTagIsBlank =
            false;

        scanButton.disabled =
            false;


        await buscarCono(
            currentNfcId
        );


    } catch (error) {

        console.error(
            "Error procesando NFC:",
            error
        );

        scanButton.disabled =
            false;

        mostrarError(
            "No se pudo procesar el NFC."
        );
    }
}


// ============================================================
// ERROR NFC
// ============================================================

function manejarErrorNFC(event) {

    console.warn(
        "Error NFC:",
        event
    );

    scanButton.disabled =
        false;

    mostrarError(
        "No se pudo leer correctamente el NFC."
    );
}


// ============================================================
// REGISTRAR NFC VACÍO
// ============================================================

async function mostrarRegistroCono() {

    try {

        mostrarEstado(
            "Generando ID del nuevo cono..."
        );


        // ----------------------------------------------------
        // OBTENER CONO-XXXX
        // ----------------------------------------------------

        const nuevoId =
            await obtenerSiguienteConoId();


        currentNfcId =
            nuevoId;


        currentTagIsBlank =
            true;


        ocultarTodo();

        mostrarEstado(
            "ID generado: " + nuevoId
        );


        // ----------------------------------------------------
        // MOSTRAR FORMULARIO
        // ----------------------------------------------------

        if (registrationCard) {

            registrationCard.style.display =
                "block";
        }


        // ----------------------------------------------------
        // ID GENERADO
        // ----------------------------------------------------

        if (inputCodigo) {

            inputCodigo.value =
                nuevoId;
        }


        // ----------------------------------------------------
        // LIMPIAR CAMPOS
        // ----------------------------------------------------

        if (inputProducto) {
            inputProducto.value = "";
        }

        if (inputPeso) {
            inputPeso.value = "";
        }

        if (inputUbicacion) {
            inputUbicacion.value = "";
        }


        // ----------------------------------------------------
        // FOCUS
        // ----------------------------------------------------

        if (inputProducto) {
            inputProducto.focus();
        }


    } catch (error) {

        console.error(
            "Error preparando registro:",
            error
        );

        mostrarError(
            "No se pudo generar el ID del cono.\n\n" +
            error.message
        );
    }
}


// ============================================================
// ESCRIBIR ID EN NFC
// ============================================================

async function escribirNFC(idNfc) {

    if (!nfcReader) {

        nfcReader =
            new NDEFReader();
    }


    if (!("NDEFReader" in window)) {

        throw new Error(
            "Este navegador no admite escritura NFC."
        );
    }


    mostrarEstado(
        "Acerca nuevamente el NFC al teléfono..."
    );


    // --------------------------------------------------------
    // ESCRIBIR TEXTO
    // --------------------------------------------------------

    await nfcReader.write({

        records: [

            {
                recordType:
                    "text",

                data:
                    idNfc
            }

        ]

    });


    console.log(
        "NFC escrito correctamente:",
        idNfc
    );
}


// ============================================================
// CANCELAR REGISTRO
// ============================================================

function cancelarRegistro() {

    if (registrationCard) {

        registrationCard.style.display =
            "none";
    }


    currentNfcId =
        "";

    currentConoData =
        null;

    currentTagIsBlank =
        false;


    ocultarTodo();
}


// ============================================================
// GUARDAR CONO
// ============================================================

async function guardarCono() {

    const idNfc =
        currentNfcId ||
        (
            inputCodigo
                ? inputCodigo.value.trim()
                : ""
        );


    const codigo =
        inputProducto
            ? inputProducto.value.trim()
            : "";


    const peso =
        inputPeso
            ? Number(
                inputPeso.value
            )
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
            "No se ha generado el ID del cono."
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


    if (
        isNaN(peso) ||
        peso < 0
    ) {

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

    if (saveRegisterButton) {

        saveRegisterButton.disabled =
            true;

        saveRegisterButton.textContent =
            "ESPERANDO NFC...";
    }


    try {

        // ====================================================
        // PASO 1
        // ESCRIBIR ID EN NFC
        // ====================================================

        if (currentTagIsBlank) {

            await escribirNFC(
                idNfc
            );
        }


        // ====================================================
        // PASO 2
        // REGISTRAR EN GOOGLE SHEETS
        // ====================================================

        if (saveRegisterButton) {

            saveRegisterButton.textContent =
                "GUARDANDO...";
        }


        const response =
            await fetch(
                "/api/google",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        action:
                            "createCono",

                        ID_NFC:
                            idNfc,

                        CODIGO:
                            codigo,

                        PESO_ACTUAL:
                            peso,

                        UBICACION:
                            ubicacion,

                        ESTADO:
                            "ACTIVO"
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Error HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        console.log(
            "Respuesta crear cono:",
            data
        );


        if (!data.success) {

            throw new Error(
                data.error ||
                "No se pudo registrar el cono."
            );
        }


        // ====================================================
        // REGISTRO COMPLETADO
        // ====================================================

        currentTagIsBlank =
            false;

        currentNfcId =
            idNfc;


        alert(
            "¡Cono registrado correctamente!\n\n" +
            "ID: " +
            idNfc
        );


        // ----------------------------------------------------
        // VOLVER A CONSULTAR
        // ----------------------------------------------------

        await buscarCono(
            idNfc
        );


    } catch (error) {

        console.error(
            "Error registrando cono:",
            error
        );


        alert(
            "No se pudo completar el registro.\n\n" +
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


// ============================================================
// ENTRADA
// ============================================================

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


// ============================================================
// SALIDA
// ============================================================

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


// ============================================================
// GUARDAR MOVIMIENTO
// ============================================================

async function guardarMovimiento(
    tipo,
    cantidad
) {

    try {

        const response =
            await fetch(
                "/api/google",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        action:
                            "saveMovement",

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
                "Error HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        if (!data.success) {

            alert(
                data.error ||
                "No se pudo registrar el movimiento."
            );

            return;
        }


        alert(
            "Movimiento " +
            tipo.toLowerCase() +
            " registrado."
        );


        await buscarCono(
            currentNfcId
        );


    } catch (error) {

        console.error(
            "Error movimiento:",
            error
        );

        alert(
            "No se pudo registrar el movimiento.\n\n" +
            error.message
        );
    }
}


// ============================================================
// HISTORIAL
// ============================================================

async function mostrarHistorial() {

    if (!currentNfcId) {

        alert(
            "Primero escanea un cono."
        );

        return;
    }


    try {

        const url =
            "/api/google?action=movements&id_nfc=" +
            encodeURIComponent(
                currentNfcId
            );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Error HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        if (!data.success) {

            alert(
                data.error ||
                "No se pudo obtener el historial."
            );

            return;
        }


        const movimientos =
            data.data || [];


        if (
            movimientos.length === 0
        ) {

            alert(
                "Este cono todavía no tiene movimientos."
            );

            return;
        }


        let texto =
            "HISTORIAL - " +
            currentNfcId +
            "\n\n";


        movimientos
            .slice()
            .reverse()
            .forEach(
                (
                    movimiento,
                    index
                ) => {

                    let fecha =
                        "";


                    if (
                        movimiento.FECHA
                    ) {

                        fecha =
                            new Date(
                                movimiento.FECHA
                            )
                                .toLocaleString(
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
            "Error historial:",
            error
        );

        alert(
            "No se pudo obtener el historial.\n\n" +
            error.message
        );
    }
}


// ============================================================
// EVENTOS
// ============================================================

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


// ============================================================
// INICIO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        ocultarTodo();

        console.log(
            "Almacen SOCO iniciado."
        );

        console.log(
            "Web NFC disponible:",
            "NDEFReader" in window
        );
    }
);