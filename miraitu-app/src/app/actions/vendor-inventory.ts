'use server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

interface FetchInventoryInput {
    shopId: string;
    page?: number;
    pageSize?: number;
    lowStockOnly?: boolean;
}

export async function fetchInventory({ shopId, page = 1, pageSize = 50, lowStockOnly = false }: FetchInventoryInput) {
    try {
        const supabase = createSupabaseAdminClient();
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('crm_products')
            .select(`
                id, name, price, unit, status, images,
                product_variants(id, name, sku, price, stock, attributes)
            `, { count: 'exact' })
            .eq('shop_id', shopId)
            .in('status', ['active', 'draft'])
            .order('name')
            .range(from, to);

        const { data, error, count } = await query;
        if (error) {
            console.error('[vendor-inventory] Fetch error:', error);
            return { error: 'Failed to fetch inventory.', data: [], total: 0 };
        }

        // Fetch inventory thresholds
        const productIds = (data || []).map(p => p.id);
        let inventoryMap = new Map<string, { stock_qty: number; low_stock_threshold: number }>();

        if (productIds.length > 0) {
            const { data: invData } = await supabase
                .from('inventory')
                .select('product_id, variant_id, stock_qty, low_stock_threshold')
                .in('product_id', productIds);

            for (const inv of invData || []) {
                const key = inv.variant_id ? `${inv.product_id}_${inv.variant_id}` : inv.product_id;
                inventoryMap.set(key, { stock_qty: inv.stock_qty, low_stock_threshold: inv.low_stock_threshold });
            }
        }

        // Build inventory items (flatten products + variants)
        const items: Array<Record<string, unknown>> = [];
        for (const product of data || []) {
            const rec = product as unknown as Record<string, unknown>;
            const variants = rec.product_variants as Array<Record<string, unknown>> || [];

            if (variants.length > 0) {
                for (const v of variants) {
                    const key = `${product.id}_${v.id}`;
                    const inv = inventoryMap.get(key);
                    const stock = inv?.stock_qty ?? (v.stock as number) ?? 0;
                    const threshold = inv?.low_stock_threshold ?? 5;
                    const isLowStock = stock <= threshold;

                    if (lowStockOnly && !isLowStock) continue;

                    items.push({
                        productId: product.id,
                        productName: product.name,
                        variantId: v.id,
                        variantName: v.name,
                        sku: v.sku,
                        price: v.price,
                        stock,
                        threshold,
                        isLowStock,
                        unit: product.unit,
                    });
                }
            } else {
                const inv = inventoryMap.get(product.id);
                const stock = inv?.stock_qty ?? 0;
                const threshold = inv?.low_stock_threshold ?? 5;
                const isLowStock = stock <= threshold;

                if (lowStockOnly && !isLowStock) continue;

                items.push({
                    productId: product.id,
                    productName: product.name,
                    variantId: null,
                    variantName: null,
                    sku: null,
                    price: product.price,
                    stock,
                    threshold,
                    isLowStock,
                    unit: product.unit,
                });
            }
        }

        return { error: null, data: items, total: count || 0 };
    } catch (err) {
        console.error('[vendor-inventory] Fetch error:', err);
        return { error: 'Unexpected error.', data: [], total: 0 };
    }
}

export async function updateStock(productId: string, variantId: string | null, newQty: number) {
    try {
        const supabase = createSupabaseAdminClient();

        // Upsert into inventory table
        const { error } = await supabase
            .from('inventory')
            .upsert({
                product_id: productId,
                variant_id: variantId,
                stock_qty: newQty,
            }, { onConflict: 'product_id,variant_id' });

        if (error) {
            console.error('[vendor-inventory] Update stock error:', error);
            return { error: 'Failed to update stock.' };
        }

        // Also update the variant's stock field if variant exists
        if (variantId) {
            await supabase
                .from('product_variants')
                .update({ stock: newQty })
                .eq('id', variantId);
        }

        return { error: null };
    } catch (err) {
        console.error('[vendor-inventory] Update stock error:', err);
        return { error: 'Unexpected error.' };
    }
}

export async function updateLowStockThreshold(productId: string, variantId: string | null, threshold: number) {
    try {
        const supabase = createSupabaseAdminClient();

        const { error } = await supabase
            .from('inventory')
            .upsert({
                product_id: productId,
                variant_id: variantId,
                low_stock_threshold: threshold,
            }, { onConflict: 'product_id,variant_id' });

        if (error) return { error: 'Failed to update threshold.' };
        return { error: null };
    } catch (err) {
        console.error('[vendor-inventory] Update threshold error:', err);
        return { error: 'Unexpected error.' };
    }
}
