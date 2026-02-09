import { NextResponse } from 'next/server';
import { getProducts, addProduct, deleteProduct } from '../../lib/db';

export async function GET() {
    const products = await getProducts();
    return NextResponse.json(products);
}

export async function POST(request: Request) {
    const data = await request.json();
    const newProduct = await addProduct(data);
    return NextResponse.json(newProduct);
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
        await deleteProduct(Number(id));
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
}
