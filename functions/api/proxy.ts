interface Env {
    // Add env vars if needed
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const url = new URL(context.request.url).searchParams.get('url');

    if (!url) {
        return new Response('Missing url parameter', { status: 400 });
    }

    try {
        // Determine headers to forward. 
        // We mainly want to act as a browser to the target
        const headers = new Headers();
        headers.set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Fetch the target
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        });

        // Create a new response to stream back
        // We copy essential headers
        const newHeaders = new Headers();
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');

        const contentType = response.headers.get('content-type');
        if (contentType) newHeaders.set('Content-Type', contentType);

        const contentLength = response.headers.get('content-length');
        if (contentLength) newHeaders.set('Content-Length', contentLength);

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });

    } catch (e: any) {
        return new Response(`Proxy error: ${e.message}`, { status: 500 });
    }
};

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': '*',
        },
    });
};
