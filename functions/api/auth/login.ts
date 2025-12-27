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

        const user = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        const hashedPassword = await hashPassword(password);
        if (user.password !== hashedPassword) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        // For simplicity, returning the user object. 
        // In a real app, we would issue a JWT or set a session cookie here.
        return new Response(JSON.stringify({
            id: user.id,
            username: user.username,
            token: 'session-token-placeholder'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
