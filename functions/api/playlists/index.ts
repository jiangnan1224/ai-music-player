interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const userId = request.headers.get('X-User-ID');

    if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const { results } = await env.DB.prepare('SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC')
            .bind(userId)
            .all();

        // Parse songs JSON string back to object
        const playlists = results.map((p: any) => ({
            ...p,
            songs: p.songs ? JSON.parse(p.songs) : []
        }));

        return new Response(JSON.stringify(playlists), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const userId = request.headers.get('X-User-ID');

    if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const body = await request.json() as any;
        const { name, description, coverUrl, songs, createdAt, updatedAt } = body;

        // Use provided ID or generate new
        const id = body.id || crypto.randomUUID();

        await env.DB.prepare(
            'INSERT INTO playlists (id, user_id, name, description, cover_url, songs, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )
            .bind(id, userId, name, description, coverUrl, JSON.stringify(songs || []), createdAt || Date.now(), updatedAt || Date.now())
            .run();

        return new Response(JSON.stringify({ id, message: 'Playlist created' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
