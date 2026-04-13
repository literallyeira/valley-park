import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    
    // Catch URLs where the Fleeca Token was appended without a query parameter or slash
    // Ex: /api/bankingf4Y54ijL... -> Rewrite to -> /api/banking?token=f4Y54ijL...
    if (url.pathname.startsWith('/api/banking') && url.pathname.length > '/api/banking'.length) {
        // Only if it doesn't have a slash right after (like /api/banking/something)
        if (url.pathname.charAt('/api/banking'.length) !== '/') {
            const token = url.pathname.slice('/api/banking'.length);
            
            // Only rewrite if it's a reasonably long token string and token parameter doesn't already exist
            if (token && token.length > 20 && !url.searchParams.has('token')) {
                const rewriteUrl = new URL(url.origin);
                rewriteUrl.pathname = '/api/banking';
                rewriteUrl.searchParams.set('token', token);
                
                // Keep original query params if any (like orderId if Fleeca appended it, though unlikely in this scenario)
                url.searchParams.forEach((val, key) => {
                    if (key !== 'token') rewriteUrl.searchParams.append(key, val);
                });

                return NextResponse.rewrite(rewriteUrl);
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/banking:path*',
};
