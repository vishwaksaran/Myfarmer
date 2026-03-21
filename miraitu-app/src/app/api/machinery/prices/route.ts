import { NextRequest, NextResponse } from 'next/server';
import { estimateOnRoadPrice, getModelPrice } from '@/lib/machinery-db';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const modelId = searchParams.get('model_id');
    const state = searchParams.get('state');
    const basePrice = searchParams.get('base_price');

    if (!state) {
        return NextResponse.json({ error: 'state parameter is required' }, { status: 400 });
    }

    // If model_id is provided, try to fetch from DB first
    if (modelId) {
        const dbPrice = await getModelPrice(modelId, state);
        if (dbPrice) {
            return NextResponse.json({
                source: 'database',
                state,
                ex_showroom: dbPrice.ex_showroom_price,
                on_road: dbPrice.on_road_price,
            });
        }
    }

    // Fallback: calculate from base_price
    const price = parseInt(basePrice || '0', 10);
    if (!price) {
        return NextResponse.json({ error: 'base_price is required when no DB price exists' }, { status: 400 });
    }

    const estimate = estimateOnRoadPrice(price, state);
    return NextResponse.json({
        source: 'estimated',
        state,
        ex_showroom: price,
        rto: estimate.rto,
        insurance: estimate.insurance,
        handling: estimate.handling,
        on_road: estimate.total,
    });
}
