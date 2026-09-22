// ============================================================
// ALMACEN SOCO - CONTROL DE CONOS NFC
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

const inputDescripcion =
    document.getElementById(
        "inputDescripcion"
    );

const inputProveedor =
    document.getElementById(
        "inputProveedor"
    );

const inputColor =
    document.getElementById(
        "inputColor"
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

const newProductNotice =
    document.getElementById(
        "newProductNotice"
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

        errorCard.style.display = "block";

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
// NFC NO ENCONTRADO
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
// BUSCAR PRODUCTO
// ============================================================

async function buscarProductoPorCodigo(codigo) {

    const response =
        await fetch(
            "/api/google?action=product&codigo=" +
            encodeURIComponent(codigo) +
            "&t=" +
            Date.now(),
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

    return await response.json();
}


// ============================================================
// LIMPIAR DATOS DEL PRODUCTO
// ============================================================

function limpiarDatosProducto() {

    if (inputDescripcion) {
        inputDescripcion.value = "";
    }

    if (inputProveedor) {
        inputProveedor.value = "";
    }

    if (inputColor) {
        inputColor.value = "";
    }
}


// ============================================================
// CAMPOS PRODUCTO
// ============================================================

function configurarCamposProducto(
    editable
) {

    if (inputDescripcion) {
        inputDescripcion.readOnly =
            !editable;
    }

    if (inputProveedor) {
        inputProveedor.readOnly =
            !editable;
    }

    if (inputColor) {
        inputColor.readOnly =
            !editable;
    }
}


// ============================================================
// CARGAR PRODUCTO EN FORMULARIO
// ============================================================

async function cargarProductoEnFormulario(
    codigo
) {

    codigo =
        String(codigo || "").trim();

    if (!codigo) {
        return;
    }

    try {

        mostrarEstado(
            "Buscando producto " +
            codigo +
            "..."
        );

        const data =
            await buscarProductoPorCodigo(
                codigo
            );

        if (!data.success) {

            throw new Error(
                data.error ||
                "No se pudo consultar el producto."
            );
        }


        // ====================================================
        // PRODUCTO EXISTENTE
        // ====================================================

        if (
            data.found &&
            data.data
        ) {

            inputDescripcion.value =
                data.data.DESCRIPCION ||
                "";

            inputProveedor.value =
                data.data.PROVEEDOR ||
                "";

            inputColor.value =
                data.data.COLOR ||
                "";

            configurarCamposProducto(
                false
            );

            if (newProductNotice) {
                newProductNotice.style.display =
                    "none";
            }

            mostrarEstado(
                "Producto encontrado. Características cargadas automáticamente."
            );

            return true;
        }


        // ====================================================
        // PRODUCTO NUEVO
        // ====================================================

        limpiarDatosProducto();

        configurarCamposProducto(
            true
        );

        if (newProductNotice) {
            newProductNotice.style.display =
                "block";
        }

        mostrarEstado(
            "Código nuevo. Completa las características del producto."
        );

        return false;


    } catch (error) {

        console.error(
            "Error buscando producto:",
            error
        );

        limpiarDatosProducto();

        configurarCamposProducto(
            true
        );

        if (newProductNotice) {
            newProductNotice.style.display =
                "block";
        }

        mostrarEstado(
            "No se pudo consultar el producto."
        );

        return false;
    }
}


// ============================================================
// MOSTRAR PRODUCTO / CONO
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
            data.CODIGO ||
            "—";
    }

    if (productDescription) {
        productDescription.textContent =
            data.DESCRIPCION ||
            "—";
    }

    if (productProvider) {
        productProvider.textContent =
            data.PROVEEDOR ||
            "—";
    }

    if (productColor) {
        productColor.textContent =
            data.COLOR ||
            "—";
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
            data.UBICACION ||
            "—";
    }

    if (productStatus) {
        productStatus.textContent =
            data.ESTADO ||
            "—";
    }

    if (nfcCode) {
        nfcCode.textContent =
            data.ID_NFC ||
            currentNfcId ||
            "—";
    }
}


// ============================================================
// BUSCAR CONO
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


        // CONO NO REGISTRADO

        if (!data.found) {

            currentConoData =
                null;

            mostrarNoEncontrado(
                idNfc
            );

            return;
        }


        // CONO ENCONTRADO

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
// SIGUIENTE ID DE CONO
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
            await fetch(
                url,
                {
                    method:"GET",
                    cache:"no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Error HTTP " +
                response.status
            );
        }

        const texto =
            await response.text();

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
                "No se pudo generar el ID."
            );
        }

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
// LECTURA NFC
// ============================================================

async function manejarLecturaNFC(
    event
) {

    console.log(
        "NFC detectado:",
        event
    );

    try {

        let contenido = "";


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

                        console.error(
                            "Error texto:",
                            error
                        );

                    }
                }


                // URI

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

                        console.error(
                            "Error URL:",
                            error
                        );
                    }
                }

            }
        }


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
// ABRIR REGISTRO
// ============================================================

async function mostrarRegistroCono() {

    try {

        ocultarTodo();

        currentNfcId =
            "";

        currentTagIsBlank =
            true;

        if (registrationCard) {

            registrationCard.style.display =
                "block";
        }

        if (inputCodigo) {

            inputCodigo.value =
                "Se generará al guardar";

            inputCodigo.readOnly =
                true;
        }

        if (inputProducto) {
            inputProducto.value =
                "";
        }

        limpiarDatosProducto();

        configurarCamposProducto(
            false
        );

        if (newProductNotice) {
            newProductNotice.style.display =
                "none";
        }

        if (inputPeso) {
            inputPeso.value =
                "";
        }

        if (inputUbicacion) {
            inputUbicacion.value =
                "";
        }

        mostrarEstado(
            "Nuevo cono. Ingresa el código del producto."
        );

        if (inputProducto) {
            inputProducto.focus();
        }

    } catch (error) {

        console.error(
            error
        );

        mostrarError(
            "No se pudo abrir el registro.\n\n" +
            error.message
        );
    }
}


// ============================================================
// ESCRIBIR NFC
// ============================================================

async function escribirNFC(idNfc) {

    if (!("NDEFReader" in window)) {

        throw new Error(
            "Este navegador no admite escritura NFC."
        );
    }


    mostrarEstado(
        "Acerca nuevamente el NFC al teléfono..."
    );


    // Detener lectura antes de escribir

    if (nfcScanController) {

        try {
            nfcScanController.abort();
        } catch (e) {}

        nfcScanController =
            null;

        nfcReadingActive =
            false;

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    150
                )
        );
    }


    const writer =
        new NDEFReader();


    await writer.write({

        records: [

            {
                recordType:"text",
                data:idNfc
            }

        ]

    });


    console.log(
        "NFC escrito:",
        idNfc
    );
}


// ============================================================
// CANCELAR
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

    const codigo =
        inputProducto
            ? inputProducto.value.trim()
            : "";

    const descripcion =
        inputDescripcion
            ? inputDescripcion.value.trim()
            : "";

    const proveedor =
        inputProveedor
            ? inputProveedor.value.trim()
            : "";

    const color =
        inputColor
            ? inputColor.value.trim()
            : "";

    const peso =
        inputPeso
            ? Number(inputPeso.value)
            : 0;

    const ubicacion =
        inputUbicacion
            ? inputUbicacion.value.trim()
            : "";


    // VALIDACIONES

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


    if (saveRegisterButton) {

        saveRegisterButton.disabled =
            true;

        saveRegisterButton.textContent =
            "PREPARANDO...";
    }


    try {

        // ====================================================
        // 1. CONSULTAR PRODUCTO
        // ====================================================

        const productoData =
            await buscarProductoPorCodigo(
                codigo
            );


        if (!productoData.success) {

            throw new Error(
                productoData.error ||
                "No se pudo consultar el producto."
            );
        }


        let datosProducto;


        // ====================================================
        // PRODUCTO EXISTENTE
        // ====================================================

        if (
            productoData.found &&
            productoData.data
        ) {

            datosProducto =
                productoData.data;

        }


        // ====================================================
        // PRODUCTO NUEVO
        // ====================================================

        else {

            if (!descripcion) {

                alert(
                    "Este código es nuevo. Ingresa la descripción del producto."
                );

                if (inputDescripcion) {
                    inputDescripcion.focus();
                }

                return;
            }


            if (!proveedor) {

                alert(
                    "Este código es nuevo. Ingresa el proveedor."
                );

                if (inputProveedor) {
                    inputProveedor.focus();
                }

                return;
            }


            if (!color) {

                alert(
                    "Este código es nuevo. Ingresa el color."
                );

                if (inputColor) {
                    inputColor.focus();
                }

                return;
            }


            // ================================================
            // CREAR PRODUCTO
            // ================================================

            mostrarEstado(
                "Creando producto..."
            );


            const responseProducto =
                await fetch(
                    "/api/google",
                    {
                        method:"POST",

                        headers:{
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                action:
                                    "createProduct",

                                CODIGO:
                                    codigo,

                                DESCRIPCION:
                                    descripcion,

                                PROVEEDOR:
                                    proveedor,

                                COLOR:
                                    color,

                                ESTADO:
                                    "ACTIVO"

                            })
                    }
                );


            if (!responseProducto.ok) {

                throw new Error(
                    "Error HTTP creando producto: " +
                    responseProducto.status
                );
            }


            const nuevoProducto =
                await responseProducto.json();


            if (!nuevoProducto.success) {

                throw new Error(
                    nuevoProducto.error ||
                    "No se pudo crear el producto."
                );
            }


            datosProducto =
                nuevoProducto.data;
        }


        // ====================================================
        // 2. OBTENER ID DEL CONO
        // ====================================================

        mostrarEstado(
            "Generando ID del cono..."
        );


        const idNfc =
            await obtenerSiguienteConoId();


        currentNfcId =
            idNfc;


        // ====================================================
        // 3. ESCRIBIR NFC
        // ====================================================

        mostrarEstado(
            "Preparando NFC " +
            idNfc +
            "..."
        );


        if (currentTagIsBlank) {

            await escribirNFC(
                idNfc
            );
        }


        // ====================================================
        // 4. GUARDAR CONO
        // ====================================================

        if (saveRegisterButton) {

            saveRegisterButton.textContent =
                "GUARDANDO...";
        }


        const response =
            await fetch(
                "/api/google",
                {

                    method:"POST",

                    headers:{
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


        if (!data.success) {

            throw new Error(
                data.error ||
                "No se pudo registrar el cono."
            );
        }


        // ====================================================
        // FINALIZADO
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

                    method:"POST",

                    headers:{
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
// BUSCAR PRODUCTO AL ESCRIBIR CÓDIGO
// ============================================================

if (inputProducto) {

    let temporizadorProducto;


    inputProducto.addEventListener(
        "input",
        function() {

            clearTimeout(
                temporizadorProducto
            );


            const codigo =
                inputProducto.value.trim();


            if (!codigo) {

                limpiarDatosProducto();

                configurarCamposProducto(
                    false
                );

                if (newProductNotice) {
                    newProductNotice.style.display =
                        "none";
                }

                return;
            }


            temporizadorProducto =
                setTimeout(
                    () => {

                        cargarProductoEnFormulario(
                            codigo
                        );

                    },
                    500
                );

        }
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