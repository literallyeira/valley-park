import { NextResponse } from 'next/server';

const CLIENT_ID = '55';
const CLIENT_SECRET = 'SvirJd6IxWkhRKbuu6MgbjyqjdyHbpwdhcACspIH';
const REDIRECT_URI = 'https://valley-park.business/api/auth';

const CLOUDFLARE_SAFE_HEADERS = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Origin': 'https://ucp-tr.gta.world',
    'Referer': 'https://ucp-tr.gta.world/',
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/?error=no_auth_code', request.url));
    }

    try {
        // Exchange code for token
        const tokenResponse = await fetch('https://ucp-tr.gta.world/oauth/token', {
            method: 'POST',
            headers: CLOUDFLARE_SAFE_HEADERS,
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            })
        });

        if (!tokenResponse.ok) {
            console.error('Token fetch failed', await tokenResponse.text());
            return NextResponse.redirect(new URL('/?error=token_failed', request.url));
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Fetch user profile
        const userResponse = await fetch('https://ucp-tr.gta.world/api/user', {
            headers: {
                'User-Agent': CLOUDFLARE_SAFE_HEADERS['User-Agent'],
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        if (!userResponse.ok) {
            console.error('User fetch failed', await userResponse.text());
            return NextResponse.redirect(new URL('/?error=user_failed', request.url));
        }

        const userData = await userResponse.json();
        const user = userData.user;

        // Since we cannot easily set localStorage from a Server endpoint without rendering HTML,
        // we will generate an HTML page that stores the data in localStorage and redirects to /select-character
        const html = `
            <!DOCTYPE html>
            <html>
            <head><title>Giriş Yapılıyor...</title></head>
            <body style="background: black; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
                <div style="text-align: center;">
                    <h2>Giriş Başarılı, Yönlendiriliyorsunuz...</h2>
                </div>
                <script>
                    const gtaUser = {
                        gtawId: ${user.id},
                        username: "${user.username}",
                        characters: ${JSON.stringify(user.character || [])}
                    };
                    localStorage.setItem('vp_temp_gtaw_user', JSON.stringify(gtaUser));
                    window.location.href = '/select-character';
                </script>
            </body>
            </html>
        `;

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    } catch (error) {
        console.error('OAuth Error:', error);
        return NextResponse.redirect(new URL('/?error=oauth_error', request.url));
    }
}
