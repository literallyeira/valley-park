import { NextResponse } from 'next/server';
import { getSiteConfig, setSiteConfig } from '../../lib/db';

const DEFAULT_NAV = [
    { label: 'TÜM ÜRÜNLER', href: '/' },
    { label: 'GİYİM', href: '/?category=Giyim' },
    { label: 'AKSESUAR', href: '/?category=Aksesuar' }
];

const DEFAULT_BANNERS = [
    { image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1000&auto=format&fit=crop', title: 'YENİ SEZON', buttonText: 'ALIŞVERİŞE BAŞLA', buttonLink: '/' },
    { image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop', title: 'AKSESUARLAR', buttonText: 'GÖZ AT', buttonLink: '/?category=Aksesuar' }
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const keys = searchParams.get('keys');
    const keyList = keys ? keys.split(',') : ['nav_items', 'hero_banners'];

    const result: Record<string, unknown> = {};
    for (const key of keyList) {
        const val = await getSiteConfig(key);
        if (key === 'nav_items') result.nav_items = val || DEFAULT_NAV;
        else if (key === 'hero_banners') result.hero_banners = val || DEFAULT_BANNERS;
        else result[key] = val;
    }
    return NextResponse.json(result);
}

export async function PUT(request: Request) {
    const data = await request.json();
    const { key, value } = data;
    if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
    await setSiteConfig(key, value);
    return NextResponse.json({ success: true });
}
