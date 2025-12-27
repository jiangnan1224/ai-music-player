import { hashPassword } from '../../utils';

interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    try {
        const { username, password } = await request.json() as any;

        if (!username || !password) {
            return new Response(JSON.stringify({ error: 'Username and password required' }), { status: 400 });
        }

        // Check if user exists
        const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
        if (existing) {
            return new Response(JSON.stringify({ error: 'Username already taken' }), { status: 409 });
        }

        const id = crypto.randomUUID();
        const hashedPassword = await hashPassword(password);

        await env.DB.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)')
            .bind(id, username, hashedPassword)
            .run();

        return new Response(JSON.stringify({ id, username, message: 'User registered successfully' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
