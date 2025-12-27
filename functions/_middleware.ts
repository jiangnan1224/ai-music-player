export const onRequest: PagesFunction = async (context) => {
    const { request, next } = context;

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "86400",
            },
        });
    }

    try {
        const response = await next();
        const newResponse = new Response(response.body, response);

        // Add CORS headers to the response
        newResponse.headers.set("Access-Control-Allow-Origin", "*");
        newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

        return newResponse;
    } catch (err: any) {
        // Fallback error handling with CORS
        return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            }
        });
    }
};
