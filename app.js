// ============================================================
// ALMACEN SOCO - CONTROL DE CONOS NFC
// ============================================================


// ============================================================
// VARIABLES
// ============================================================

let currentNfcId = "";

let currentConoData = null;

let nfcReader = null;

let nfcReadingActive = false;

let nfcScanController = null;

let currentTagIsBlank = false;



// ============================================================
// ELEMENTOS HTML
// ============================================================

const scanButton =
    document.getElementById("scanButton");

const statusCard =
    document.getElementById("status");

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


// ============================================================
// FORMULARIO
// ============================================================

const registerProductButton =
    document.getElementById(
        "registerProductButton"
    );

const registerCard =
    document.getElementById(
        "registerCard"
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

const registerStatus =
    document.getElementById(
        "registerStatus"
    );

const registerStatusText =
    document.getElementById(
        "registerStatusText"
    );


// ============================================================
// ACCIONES
// ============================================================

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

    if (resultCard) {

        resultCard.classList.add(
            "hidden"
        );

    }

    if (notFoundCard) {

        notFoundCard.classList.add(
            "hidden"
        );

    }

    if (registerCard) {

        registerCard.classList.add(
            "hidden"
        );

    }

    if (errorCard) {

        errorCard.classList.add(
            "hidden"
        );

    }

}


// ============================================================
// ESTADO
// ============================================================

function mostrarEstado(
    mensaje,
    tipo = "waiting"
) {

    if (!statusCard) {
        return;
    }

    statusCard.className =
        "status " + tipo;

    if (statusText) {

        statusText.textContent =
            mensaje;

    }

}


// ============================================================
// ESTADO DEL REGISTRO
// ============================================================

function mostrarEstadoRegistro(
    mensaje,
    tipo = "waiting"
) {

    if (!registerStatus) {
        return;
    }

    registerStatus.className =
        "status " + tipo;

    if (registerStatusText) {

        registerStatusText.textContent =
            mensaje;

    }

}


// ============================================================
// ERROR
// ============================================================

function mostrarError(
    mensaje
) {

    ocultarTodo();

    if (errorCard) {

        errorCard.classList.remove(
            "hidden"
        );

        const errorText =
            document.getElementById(
                "errorText"
            );

        if (errorText) {

            errorText.textContent =
                mensaje;

        }

    } else {

        alert(mensaje);

    }

}


// ============================================================
// FORMATEAR PESO
// ============================================================

function formatearPeso(
    valor
) {

    const numero =
        Number(valor);

    if (isNaN(numero)) {

        return "0 g";

    }

    return (
        numero.toLocaleString(
            "es-PE"
        ) +
        " g"
    );

}


// ============================================================
// MOSTRAR CONO NO REGISTRADO
// ============================================================

function mostrarNoEncontrado(
    idNfc
) {

    ocultarTodo();

    if (notFoundCard) {

        notFoundCard.classList.remove(
            "hidden"
        );

    }

    if (notFoundCode) {

        notFoundCode.textContent =
            idNfc;

    }

    mostrarEstado(
        "Cono no registrado",
        "waiting"
    );

}


// ============================================================
// MOSTRAR PRODUCTO
// ============================================================

function mostrarProducto(
    data
) {

    ocultarTodo();

    currentConoData =
        data;


    if (resultCard) {

        resultCard.classList.remove(
            "hidden"
        );

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


    mostrarEstado(
        "Cono encontrado",
        "success"
    );

}


// ============================================================
// BUSCAR CONO EN GOOGLE SHEETS
// ============================================================

async function buscarCono(
    idNfc
) {

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
            encodeURIComponent(
                idNfc
            );


        const response =
            await fetch(
                url,
                {
                    cache: "no-store"
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

            currentTagIsBlank =
                false;

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
//
// IMPORTANTE:
//
// Esta función solamente se llama al GUARDAR.
// Ya no se llama al abrir el formulario.
//
// ============================================================

async function obtenerSiguienteConoId() {

    try {

        mostrarEstado(
            "Generando ID del cono..."
        );


        const url =
            "/api/google?action=nextConoId&t=" +
            Date.now();


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


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
                JSON.parse(
                    texto
                );

        } catch (error) {

            throw new Error(
                "El servidor no devolvió JSON válido:\n" +
                texto
            );

        }


        if (
            !data.success ||
            !data.id_nfc
        ) {

            throw new Error(
                data.error ||
                "No se pudo generar el ID."
            );

        }


        console.log(
            "ID generado:",
            data.id_nfc
        );


        return data.id_nfc;


    } catch (error) {

        console.error(
            "Error obteniendo ID:",
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
            "Usa Google Chrome en tu Samsung Galaxy S21+."
        );

        return;

    }

    try {

        if (!nfcReader) {

            nfcReader =
                new NDEFReader();

        }

        mostrarEstado(
            "Acerca el NFC del cono al teléfono...",
            "reading"
        );

        scanButton.disabled =
            true;


        if (!nfcReadingActive) {

            // Controlador para poder detener
            // el escaneo antes de escribir.

            nfcScanController =
                new AbortController();


            await nfcReader.scan({
                signal:
                    nfcScanController.signal
            });


            nfcReadingActive =
                true;


            nfcReader.onreading =
                manejarLecturaNFC;


            nfcReader.onreadingerror =
                manejarErrorNFC;

        }

    } catch (error) {

        // AbortError es normal cuando nosotros
        // detenemos el escaneo para escribir.

        if (
            error.name ===
            "AbortError"
        ) {

            console.log(
                "Escaneo NFC detenido."
            );

            return;

        }


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

async function manejarLecturaNFC(
    event
) {

    console.log(
        "NFC detectado:",
        event
    );


    try {

        let contenido =
            "";


        // ----------------------------------------------------
        // LEER NDEF
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
                    "Registro NFC:",
                    record
                );


                // TEXTO

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


                // URL

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

                notFoundCard.classList.remove(
                    "hidden"
                );

            }


            if (notFoundCode) {

                notFoundCode.textContent =
                    "NFC VACÍO";

            }


            mostrarEstado(
                "NFC vacío",
                "waiting"
            );


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
            "No se pudo procesar el NFC.\n\n" +
            error.message
        );

    }

}


// ============================================================
// ERROR NFC
// ============================================================

function manejarErrorNFC(
    event
) {

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
// ABRIR REGISTRO
// ============================================================
//
// IMPORTANTE:
//
// Aquí NO generamos todavía CONO-XXXX.
//
// Solo mostramos el formulario.
// El ID se genera al pulsar GUARDAR.
//
// ============================================================

function mostrarRegistroCono() {

    try {

        ocultarTodo();


        currentNfcId =
            "";


        // Como estamos registrando
        // un NFC vacío.

        currentTagIsBlank =
            true;


        currentConoData =
            null;


        // ----------------------------------------------------
        // MOSTRAR FORMULARIO
        // ----------------------------------------------------

        if (registerCard) {

            registerCard.classList.remove(
                "hidden"
            );

        }


        // ----------------------------------------------------
        // ID PENDIENTE
        // ----------------------------------------------------

        if (inputCodigo) {

            inputCodigo.value =
                "Se generará al guardar";

        }


        // ----------------------------------------------------
        // LIMPIAR CAMPOS
        // ----------------------------------------------------

        if (inputProducto) {

            inputProducto.value =
                "";

        }


        if (inputPeso) {

            inputPeso.value =
                "";

        }


        if (inputUbicacion) {

            inputUbicacion.value =
                "";

        }


        if (registerStatus) {

            registerStatus.classList.add(
                "hidden"
            );

        }


        mostrarEstado(
            "Completa los datos del cono.",
            "waiting"
        );


        // ----------------------------------------------------
        // FOCUS
        // ----------------------------------------------------

        setTimeout(
            () => {

                if (inputProducto) {

                    inputProducto.focus();

                }

            },
            300
        );


    } catch (error) {

        console.error(
            "Error preparando registro:",
            error
        );


        mostrarError(
            "No se pudo abrir el registro.\n\n" +
            error.message
        );

    }

}


// ============================================================
// ESCRIBIR ID EN NFC
// ============================================================

async function escribirNFC(
    idNfc
) {

    if (
        !("NDEFReader" in window)
    ) {

        throw new Error(
            "Este navegador no admite escritura NFC."
        );

    }


    // Usamos un lector nuevo
    // exclusivamente para escribir.

    const writer =
        new NDEFReader();


    mostrarEstado(
        "Acerca nuevamente el NFC al teléfono...",
        "reading"
    );


    await writer.write({

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

    if (registerCard) {

        registerCard.classList.add(
            "hidden"
        );

    }


    currentNfcId =
        "";

    currentConoData =
        null;

    currentTagIsBlank =
        false;


    mostrarEstado(
        "Esperando...",
        "waiting"
    );

}


// ============================================================
// GUARDAR CONO
// ============================================================

async function guardarCono() {

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


    // ========================================================
    // VALIDACIONES
    // ========================================================

    if (!currentTagIsBlank) {

        alert(
            "Este registro no corresponde a un NFC vacío."
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


    if (!ubicacion) {

        alert(
            "Ingresa la ubicación del cono."
        );


        if (inputUbicacion) {

            inputUbicacion.focus();

        }


        return;

    }


    // ========================================================
    // DESACTIVAR BOTÓN
    // ========================================================

    if (saveRegisterButton) {

        saveRegisterButton.disabled =
            true;

        saveRegisterButton.textContent =
            "GENERANDO ID...";

    }


    try {

        // ====================================================
        // PASO 1
        // GENERAR ID
        // ====================================================

        const idNfc =
            await obtenerSiguienteConoId();


        currentNfcId =
            idNfc;


        if (inputCodigo) {

            inputCodigo.value =
                idNfc;

        }


        // ====================================================
        // PASO 2
        // ESCRIBIR NFC
        // ====================================================

        if (saveRegisterButton) {

            saveRegisterButton.textContent =
                "ACERCA EL NFC...";

        }


        mostrarEstadoRegistro(
            "Acerca nuevamente el NFC al teléfono...",
            "reading"
        );


        await escribirNFC(
            idNfc
        );


        // ====================================================
        // PASO 3
        // GUARDAR EN GOOGLE SHEETS
        // ====================================================

        if (saveRegisterButton) {

            saveRegisterButton.textContent =
                "GUARDANDO...";

        }


        mostrarEstadoRegistro(
            "Guardando cono...",
            "reading"
        );


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

                    body:
                        JSON.stringify({

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


        mostrarEstadoRegistro(
            "Cono registrado correctamente.",
            "success"
        );


        alert(
            "¡Cono registrado correctamente!\n\n" +
            "ID: " +
            idNfc
        );


        // ====================================================
        // VOLVER A CONSULTAR
        // ====================================================

        await buscarCono(
            idNfc
        );


    } catch (error) {

        console.error(
            "Error registrando cono:",
            error
        );


        mostrarEstadoRegistro(
            error.message,
            "error"
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

                    body:
                        JSON.stringify({

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
            await fetch(
                url,
                {
                    cache: "no-store"
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


        alert(
            texto
        );


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


        if (statusCard) {

            statusCard.classList.remove(
                "hidden"
            );

            statusCard.className =
                "status waiting";

        }


        if (statusText) {

            statusText.textContent =
                "Esperando...";

        }


        console.log(
            "Almacen SOCO iniciado."
        );


        console.log(
            "Web NFC disponible:",
            "NDEFReader" in window
        );

    }
);