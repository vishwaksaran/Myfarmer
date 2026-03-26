import supabase from './supabase';

// ============================================
// SUPABASE DATABASE & STORAGE HELPER FUNCTIONS
// ============================================

/**
 * Upload images to Supabase Storage
 * @param bucket - Storage bucket name ('seller-images' or 'service-images')
 * @param userId - User ID (used as folder name for RLS)
 * @param files - Array of File objects to upload
 * @returns Array of public URLs for uploaded images
 */
export async function uploadImages(
    bucket: 'seller-images' | 'service-images',
    userId: string,
    files: File[]
): Promise<string[]> {
    const urls: string[] = [];

    for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error(`Error uploading ${file.name}:`, error);
            continue;
        }

        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
            urls.push(urlData.publicUrl);
        }
    }

    return urls;
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(bucket: 'seller-images' | 'service-images', path: string): Promise<boolean> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
        console.error('Error deleting image:', error);
        return false;
    }
    return true;
}


// ============================================
// SELLER OPERATIONS
// ============================================

export interface SellerRecord {
    id?: string;
    user_id: string;
    seller_type: string;
    full_name: string;
    phone?: string;
    email?: string;
    business_name?: string;
    location?: string;
    form_data: Record<string, unknown>;
    images?: string[];
    status?: string;
    created_at?: string;
}

/**
 * Create a new seller registration
 */
export async function createSeller(seller: Omit<SellerRecord, 'id' | 'created_at' | 'status'>): Promise<{ data: SellerRecord | null; error: string | null }> {
    const { data, error } = await supabase
        .from('sellers')
        .insert(seller)
        .select()
        .single();

    if (error) {
        console.error('Error creating seller:', error);
        return { data: null, error: error.message };
    }
    return { data, error: null };
}

/**
 * Get seller record for current user
 */
export async function getSellerByUserId(userId: string): Promise<SellerRecord | null> {
    const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        console.error('Error fetching seller:', error);
        return null;
    }
    return data;
}

/**
 * Update seller record
 */
export async function updateSeller(
    sellerId: string,
    updates: Partial<SellerRecord>
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('sellers')
        .update(updates)
        .eq('id', sellerId);

    if (error) {
        console.error('Error updating seller:', error);
        return { error: error.message };
    }
    return { error: null };
}


// ============================================
// SERVICE OPERATIONS
// ============================================

export interface ServiceRecord {
    id?: string;
    seller_id?: string;
    user_id: string;
    service_type: string;
    type_label?: string;
    type_icon?: string;
    title: string;
    description?: string;
    price?: string;
    unit?: string;
    area?: string;
    availability?: string;
    images?: string[];
    status?: string;
    created_at?: string;
}

/**
 * Create a new service listing
 */
export async function createService(service: Omit<ServiceRecord, 'id' | 'created_at'>): Promise<{ data: ServiceRecord | null; error: string | null }> {
    const { data, error } = await supabase
        .from('services')
        .insert(service)
        .select()
        .single();

    if (error) {
        console.error('Error creating service:', error);
        return { data: null, error: error.message };
    }
    return { data, error: null };
}

/**
 * Get all services for a user
 */
export async function getServicesByUserId(userId: string): Promise<ServiceRecord[]> {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching services:', error);
        return [];
    }
    return data || [];
}

/**
 * Delete a service
 */
export async function deleteService(serviceId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

    if (error) {
        console.error('Error deleting service:', error);
        return { error: error.message };
    }
    return { error: null };
}

/**
 * Update a service
 */
export async function updateService(
    serviceId: string,
    updates: Partial<ServiceRecord>
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', serviceId);

    if (error) {
        console.error('Error updating service:', error);
        return { error: error.message };
    }
    return { error: null };
}


// ============================================
// PROFILE OPERATIONS
// ============================================

export interface ProfileRecord {
    id: string;
    full_name?: string;
    phone?: string;
    avatar_url?: string;
    role?: string;
    farm_location?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Get user profile
 */
export async function getProfile(userId: string): Promise<ProfileRecord | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

/**
 * Update user profile
 */
export async function updateProfile(
    userId: string,
    updates: Partial<ProfileRecord>
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updates })
        .eq('id', userId);

    if (error) {
        console.error('Error updating profile:', error);
        return { error: error.message };
    }
    return { error: null };
}


// ============================================
// MARKETPLACE LISTING OPERATIONS
// ============================================

export interface ListingRecord {
    id?: string;
    user_id: string;
    listing_type: 'machinery' | 'crops' | 'livestock';
    category: string;
    title: string;
    brand?: string;
    model?: string;
    description?: string;
    price: number;
    unit?: string;
    location: string;
    district?: string;
    state?: string;
    images?: string[];
    specs?: Record<string, unknown>;
    status?: string;
    created_at?: string;
    updated_at?: string;
}

export async function uploadListingImages(
    userId: string,
    files: File[]
): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error } = await supabase.storage
            .from('listing-images')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (error) {
            console.error(`Error uploading ${file.name}:`, error);
            continue;
        }

        const { data: urlData } = supabase.storage
            .from('listing-images')
            .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
            urls.push(urlData.publicUrl);
        }
    }
    return urls;
}

export async function createListing(listing: Omit<ListingRecord, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<{ data: ListingRecord | null; error: string | null }> {
    const { data, error } = await supabase
        .from('marketplace_listings')
        .insert(listing)
        .select()
        .single();

    if (error) {
        console.error('Error creating listing:', error);
        return { data: null, error: error.message };
    }
    return { data, error: null };
}

export async function getListingsByUser(userId: string): Promise<ListingRecord[]> {
    const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user listings:', error);
        return [];
    }
    return data || [];
}

export async function getActiveListings(listingType?: string, category?: string): Promise<ListingRecord[]> {
    let query = supabase
        .from('marketplace_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (listingType) query = query.eq('listing_type', listingType);
    if (category) query = query.eq('category', category);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching listings:', error);
        return [];
    }
    return data || [];
}

export async function updateListingStatus(listingId: string, status: string): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('marketplace_listings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', listingId);

    if (error) {
        console.error('Error updating listing:', error);
        return { error: error.message };
    }
    return { error: null };
}


// ============================================
// ORDER OPERATIONS
// ============================================

export interface OrderRecord {
    id?: string;
    user_id: string;
    order_number: string;
    items: Record<string, unknown>[];
    subtotal: number;
    total: number;
    shipping_address: Record<string, string>;
    payment_method: string;
    status?: string;
    created_at?: string;
}

export async function createOrder(order: Omit<OrderRecord, 'id' | 'created_at' | 'status'>): Promise<{ data: OrderRecord | null; error: string | null }> {
    const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();

    if (error) {
        console.error('Error creating order:', error);
        return { data: null, error: error.message };
    }
    return { data, error: null };
}

export async function getOrdersByUser(userId: string): Promise<OrderRecord[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
    return data || [];
}
