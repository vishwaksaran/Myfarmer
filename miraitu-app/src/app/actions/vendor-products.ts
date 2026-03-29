'use server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

interface FetchProductsInput {
    shopId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
}

export async function fetchProducts({ shopId, page = 1, pageSize = 20, search = '', status = '' }: FetchProductsInput) {
    try {
        const supabase = createSupabaseAdminClient();
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('crm_products')
            .select(`
                id, name, description, price, compare_at_price, unit, tags, images, status,
                category_id, created_at, updated_at,
                shop_categories(id, name, slug, icon),
                product_variants(id)
            `, { count: 'exact' })
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (status) {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query;
        if (error) {
            console.error('[vendor-products] Fetch error:', error);
            return { error: 'Failed to fetch products.', data: [], total: 0 };
        }

        const products = (data || []).map((p) => {
            const rec = p as unknown as Record<string, unknown>;
            const variants = rec.product_variants as unknown[];
            return { ...p, variantCount: variants?.length || 0 };
        });

        return { error: null, data: products, total: count || 0 };
    } catch (err) {
        console.error('[vendor-products] Fetch error:', err);
        return { error: 'Unexpected error.', data: [], total: 0 };
    }
}

export async function getProduct(productId: string, shopId: string) {
    try {
        const supabase = createSupabaseAdminClient();

        const { data, error } = await supabase
            .from('crm_products')
            .select(`
                id, name, description, price, compare_at_price, unit, tags, images, status,
                category_id, created_at, updated_at,
                shop_categories(id, name, slug, icon),
                product_variants(id, name, sku, price, stock, attributes, sort_order)
            `)
            .eq('id', productId)
            .eq('shop_id', shopId)
            .single();

        if (error || !data) return { error: 'Product not found.', data: null };
        return { error: null, data };
    } catch (err) {
        console.error('[vendor-products] Get error:', err);
        return { error: 'Unexpected error.', data: null };
    }
}

interface ProductInput {
    name: string;
    description?: string;
    price?: number;
    compareAtPrice?: number;
    categoryId?: string;
    unit?: string;
    tags?: string[];
    status?: string;
}

export async function createProduct(shopId: string, vendorId: string, input: ProductInput) {
    try {
        const supabase = createSupabaseAdminClient();

        const { data, error } = await supabase
            .from('crm_products')
            .insert({
                shop_id: shopId,
                name: input.name,
                description: input.description || null,
                price: input.price || null,
                compare_at_price: input.compareAtPrice || null,
                category_id: input.categoryId || null,
                unit: input.unit || null,
                tags: input.tags || [],
                status: input.status || 'draft',
                created_by: vendorId,
            })
            .select('id, name, status, created_at')
            .single();

        if (error) {
            console.error('[vendor-products] Create error:', error);
            return { error: 'Failed to create product.', data: null };
        }

        return { error: null, data };
    } catch (err) {
        console.error('[vendor-products] Create error:', err);
        return { error: 'Unexpected error.', data: null };
    }
}

export async function updateProduct(productId: string, shopId: string, input: Partial<ProductInput>) {
    try {
        const supabase = createSupabaseAdminClient();

        const update: Record<string, unknown> = {};
        if (input.name !== undefined) update.name = input.name;
        if (input.description !== undefined) update.description = input.description;
        if (input.price !== undefined) update.price = input.price;
        if (input.compareAtPrice !== undefined) update.compare_at_price = input.compareAtPrice;
        if (input.categoryId !== undefined) update.category_id = input.categoryId || null;
        if (input.unit !== undefined) update.unit = input.unit;
        if (input.tags !== undefined) update.tags = input.tags;
        if (input.status !== undefined) update.status = input.status;

        const { error } = await supabase
            .from('crm_products')
            .update(update)
            .eq('id', productId)
            .eq('shop_id', shopId);

        if (error) {
            console.error('[vendor-products] Update error:', error);
            return { error: 'Failed to update product.' };
        }

        return { error: null };
    } catch (err) {
        console.error('[vendor-products] Update error:', err);
        return { error: 'Unexpected error.' };
    }
}

export async function deleteProduct(productId: string, shopId: string) {
    try {
        const supabase = createSupabaseAdminClient();

        const { error } = await supabase
            .from('crm_products')
            .delete()
            .eq('id', productId)
            .eq('shop_id', shopId);

        if (error) {
            console.error('[vendor-products] Delete error:', error);
            return { error: 'Failed to delete product.' };
        }

        return { error: null };
    } catch (err) {
        console.error('[vendor-products] Delete error:', err);
        return { error: 'Unexpected error.' };
    }
}

interface VariantInput {
    name: string;
    sku?: string;
    price: number;
    stock?: number;
    attributes?: Record<string, string>;
}

export async function createVariant(productId: string, input: VariantInput) {
    try {
        const supabase = createSupabaseAdminClient();

        const { data, error } = await supabase
            .from('product_variants')
            .insert({
                product_id: productId,
                name: input.name,
                sku: input.sku || null,
                price: input.price,
                stock: input.stock || 0,
                attributes: input.attributes || {},
            })
            .select('id, name, sku, price, stock')
            .single();

        if (error) {
            console.error('[vendor-products] Create variant error:', error);
            return { error: 'Failed to create variant.', data: null };
        }

        return { error: null, data };
    } catch (err) {
        console.error('[vendor-products] Create variant error:', err);
        return { error: 'Unexpected error.', data: null };
    }
}

export async function updateVariant(variantId: string, input: Partial<VariantInput>) {
    try {
        const supabase = createSupabaseAdminClient();

        const update: Record<string, unknown> = {};
        if (input.name !== undefined) update.name = input.name;
        if (input.sku !== undefined) update.sku = input.sku;
        if (input.price !== undefined) update.price = input.price;
        if (input.stock !== undefined) update.stock = input.stock;
        if (input.attributes !== undefined) update.attributes = input.attributes;

        const { error } = await supabase
            .from('product_variants')
            .update(update)
            .eq('id', variantId);

        if (error) return { error: 'Failed to update variant.' };
        return { error: null };
    } catch (err) {
        console.error('[vendor-products] Update variant error:', err);
        return { error: 'Unexpected error.' };
    }
}

export async function deleteVariant(variantId: string) {
    try {
        const supabase = createSupabaseAdminClient();

        const { error } = await supabase
            .from('product_variants')
            .delete()
            .eq('id', variantId);

        if (error) return { error: 'Failed to delete variant.' };
        return { error: null };
    } catch (err) {
        console.error('[vendor-products] Delete variant error:', err);
        return { error: 'Unexpected error.' };
    }
}
