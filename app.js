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
// ELEMENTOS DE REGISTRO
// ======================================================

const registerArea =
    document.getElementById("registerArea");

const registerButton =
    document.getElementById("registerButton");

const registerCard =
    document.getElementById("registerCard");

const inputNfc =
    document.getElementById("inputNfc");

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
// VARIABLE DEL NFC ACTUAL
// ======================================================

let currentNfcId = "";


// ======================================================
// ESTADO GENERAL
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
// DECODIFICAR NFC
// ======================================================

function decodeRecord(record) {

    try {

        const decoder = new TextDecoder(
            record.encoding || "utf-8"
        );

        return decoder.decode(record.data);

    }

    catch (error) {

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
// CONSULTAR INVENTARIO
// ======================================================

async function buscarInventario(idNfc) {

    const url =
        `/api/google?action=inventory&id_nfc=${encodeURIComponent(idNfc)}`;

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
// MOSTRAR DATOS DEL INVENTARIO
// ======================================================

function mostrarInventario(data, codigoNfc) {

    if (!data.found || !data.data) {

        // NFC NO REGISTRADO

        currentNfcId = codigoNfc;

        showResult(
            codigoNfc,
            "Este NFC todavía no está registrado en el inventario.",
            "NTAG / NO REGISTRADO"
        );


        // Mostrar botón de registro

        registerArea.classList.remove("hidden");

        return;

    }


    // NFC YA REGISTRADO

    registerArea.classList.add("hidden");

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
// ABRIR FORMULARIO
// ======================================================

function abrirFormularioRegistro() {

    if (!currentNfcId) {

        showError(
            "Primero debes leer un NFC."
        );

        return;

    }


    // Colocar automáticamente el ID

    inputNfc.value =
        currentNfcId;


    // Mostrar formulario

    registerCard.classList.remove("hidden");


    // Limpiar campos

    inputCodigo.value = "";

    inputDescripcion.value = "";

    inputProveedor.value = "";

    inputColor.value = "";

    inputPeso.value = "";

    inputUbicacion.value = "";


    registerStatus.classList.add("hidden");


    // Llevar la pantalla al formulario

    registerCard.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    // Enfocar código

    setTimeout(() => {

        inputCodigo.focus();

    }, 400);

}


// ======================================================
// CERRAR FORMULARIO
// ======================================================

function cerrarFormularioRegistro() {

    registerCard.classList.add("hidden");

}


// ======================================================
// GUARDAR NUEVO CONO
// ======================================================

async function guardarCono() {

    const idNfc =
        inputNfc.value.trim();

    const codigo =
        inputCodigo.value.trim();

    const descripcion =
        inputDescripcion.value.trim();

    const proveedor =
        inputProveedor.value.trim();

    const color =
        inputColor.value.trim();

    const pesoInicial =
        inputPeso.value.trim();

    const ubicacion =
        inputUbicacion.value.trim();


    // ==================================================
    // VALIDACIONES
    // ==================================================

    if (!idNfc) {

        mostrarEstadoRegistro(
            "error",
            "No se encontró el ID del NFC."
        );

        return;

    }


    if (!codigo) {

        mostrarEstadoRegistro(
            "error",
            "Ingresa el código del cono."
        );

        inputCodigo.focus();

        return;

    }


    if (!descripcion) {

        mostrarEstadoRegistro(
            "error",
            "Ingresa la descripción."
        );

        inputDescripcion.focus();

        return;

    }


    if (!proveedor) {

        mostrarEstadoRegistro(
            "error",
            "Ingresa el proveedor."
        );

        inputProveedor.focus();

        return;

    }


    if (!pesoInicial) {

        mostrarEstadoRegistro(
            "error",
            "Ingresa el peso inicial."
        );

        inputPeso.focus();

        return;

    }


    if (Number(pesoInicial) < 0) {

        mostrarEstadoRegistro(
            "error",
            "El peso no puede ser negativo."
        );

        return;

    }


    // ==================================================
    // DESACTIVAR BOTÓN
    // ==================================================

    saveRegisterButton.disabled = true;


    mostrarEstadoRegistro(
        "reading",
        "Guardando cono..."
    );


    try {

        // ==================================================
        // ENVIAR A VERCEL
        // ==================================================

        const response =
            await fetch(
                "/api/google",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        action: "createInventory",

                        idNfc: idNfc,

                        codigo: codigo,

                        descripcion: descripcion,

                        proveedor: proveedor,

                        color: color,

                        pesoInicial: Number(pesoInicial),

                        ubicacion: ubicacion

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
            "Respuesta registro:",
            data
        );


        // ==================================================
        // COMPROBAR RESPUESTA
        // ==================================================

        if (!data.success) {

            throw new Error(
                data.error ||
                "No se pudo registrar el cono."
            );

        }


        // ==================================================
        // REGISTRO CORRECTO
        // ==================================================

        mostrarEstadoRegistro(
            "success",
            "Cono registrado correctamente."
        );


        setStatus(
            "success",
            "Cono registrado correctamente"
        );


        // Ocultar botón registrar

        registerArea.classList.add("hidden");


        // Actualizar resultado

        showResult(
            idNfc,
            `Código: ${codigo}
Descripción: ${descripcion}
Proveedor: ${proveedor}
Color: ${color}
Peso inicial: ${pesoInicial} g
Peso actual: ${pesoInicial} g
Ubicación: ${ubicacion || "-"}
Estado: ACTIVO`,
            "NTAG / INVENTARIO"
        );


        // Ocultar formulario después de un momento

        setTimeout(() => {

            registerCard.classList.add("hidden");

        }, 1800);


    }

    catch (error) {

        console.error(
            "Error registrando cono:",
            error
        );


        mostrarEstadoRegistro(
            "error",
            error.message
        );

    }


    finally {

        saveRegisterButton.disabled = false;

    }

}


// ======================================================
// ESTADO DEL FORMULARIO
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

    hideResult();

    registerArea.classList.add(
        "hidden"
    );

    registerCard.classList.add(
        "hidden"
    );


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


        const ndef =
            new NDEFReader();


        await ndef.scan();


        // ==================================================
        // ERROR DE LECTURA
        // ==================================================

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


        // ==================================================
        // NFC DETECTADO
        // ==================================================

        ndef.addEventListener(
            "reading",
            async ({ message, serialNumber }) => {

                console.log(
                    "NFC detectado:",
                    serialNumber
                );


                const content =
                    parseNdefMessage(message);


                const code =
                    content ||
                    serialNumber ||
                    "SIN CÓDIGO";


                currentNfcId =
                    code;


                console.log(
                    "ID NFC:",
                    code
                );


                try {

                    setStatus(
                        "reading",
                        "Buscando cono en inventario..."
                    );


                    const data =
                        await buscarInventario(
                            code
                        );


                    mostrarInventario(
                        data,
                        code
                    );


                }

                catch (error) {

                    console.error(
                        error
                    );


                    showError(
                        "El NFC se leyó correctamente, " +
                        "pero no se pudo consultar el inventario."
                    );

                }


                scanButton.disabled =
                    false;

            }
        );


    }

    catch (error) {

        console.error(
            error
        );


        scanButton.disabled =
            false;


        if (
            error.name ===
            "NotAllowedError"
        ) {

            showError(
                "El navegador no tiene permiso " +
                "para utilizar NFC."
            );

        }

        else if (
            error.name ===
            "NotSupportedError"
        ) {

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
// EVENTOS
// ======================================================

scanButton.addEventListener(
    "click",
    scanNFC
);


registerButton.addEventListener(
    "click",
    abrirFormularioRegistro
);


cancelRegisterButton.addEventListener(
    "click",
    cerrarFormularioRegistro
);


saveRegisterButton.addEventListener(
    "click",
    guardarCono
);