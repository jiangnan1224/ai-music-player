interface Env {
    DB: D1Database;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const userId = request.headers.get('X-User-ID');
    const playlistId = params.id as string;

    if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const body = await request.json() as any;
        const { name, description, coverUrl, songs, updatedAt } = body;

        // Verify ownership
        const existing = await env.DB.prepare('SELECT user_id FROM playlists WHERE id = ?').bind(playlistId).first();
        if (!existing) {
            return new Response(JSON.stringify({ error: 'Playlist not found' }), { status: 404 });
        }
        if (existing.user_id !== userId) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }

        await env.DB.prepare(
            'UPDATE playlists SET name = ?, description = ?, cover_url = ?, songs = ?, updated_at = ? WHERE id = ?'
        )
            .bind(name, description, coverUrl, JSON.stringify(songs || []), updatedAt || Date.now(), playlistId)
            .run();

        return new Response(JSON.stringify({ id: playlistId, message: 'Playlist updated' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const userId = request.headers.get('X-User-ID');
    const playlistId = params.id as string;

    if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        // Verify ownership
        const existing = await env.DB.prepare('SELECT user_id FROM playlists WHERE id = ?').bind(playlistId).first();
        if (!existing) {
            return new Response(JSON.stringify({ error: 'Playlist not found' }), { status: 404 });
        }
        if (existing.user_id !== userId) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }

        await env.DB.prepare('DELETE FROM playlists WHERE id = ?').bind(playlistId).run();

        return new Response(JSON.stringify({ id: playlistId, message: 'Playlist deleted' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
