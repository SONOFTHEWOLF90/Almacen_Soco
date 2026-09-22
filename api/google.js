export default async function handler(req, res) {
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
    const GOOGLE_SECRET = process.env.GOOGLE_SECRET;

    if (!GOOGLE_SCRIPT_URL || !GOOGLE_SECRET) {
        return res.status(500).json({
            success: false,
            error: "API no configurada en Vercel"
        });
    }

    try {

        // =========================
        // PETICIONES GET
        // =========================

        if (req.method === "GET") {

            const params = new URLSearchParams(req.query);

            params.set("secret", GOOGLE_SECRET);

            const response = await fetch(
                `${GOOGLE_SCRIPT_URL}?${params.toString()}`
            );

            const data = await response.json();

            return res.status(200).json(data);
        }


        // =========================
        // PETICIONES POST
        // =========================

        if (req.method === "POST") {

            const body = {
                ...req.body,
                secret: GOOGLE_SECRET
            };

            const response = await fetch(
                GOOGLE_SCRIPT_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(body)
                }
            );

            const data = await response.json();

            return res.status(200).json(data);
        }


        // =========================
        // OTROS MÉTODOS
        // =========================

        return res.status(405).json({
            success: false,
            error: "Método no permitido"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}