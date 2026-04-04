import { categoryProducts } from '@/app/home/shop/categoryData';
import { featuredProducts } from '@/app/home/shop/data';

export interface CheckoutItemInput {
    productId: number;
    quantity: number;
}

export interface CheckoutItemCalculated {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface CalculatedShopOrder {
    items: CheckoutItemCalculated[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    totalPaise: number;
}

function parsePriceInRupees(priceText: string): number {
    const normalized = Number(priceText.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(normalized) || normalized <= 0) {
        throw new Error(`Invalid catalog price: ${priceText}`);
    }
    return normalized;
}

const productMap = new Map<number, { name: string; unitPrice: number }>();

function buildProductMap() {
    if (productMap.size > 0) return;

    for (const product of featuredProducts) {
        productMap.set(product.id, {
            name: product.name,
            unitPrice: parsePriceInRupees(product.price),
        });
    }

    for (const products of Object.values(categoryProducts)) {
        for (const product of products) {
            productMap.set(product.id, {
                name: product.name,
                unitPrice: parsePriceInRupees(product.price),
            });
        }
    }
}

export function calculateShopOrder(items: CheckoutItemInput[]): CalculatedShopOrder {
    buildProductMap();

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Cart is empty.');
    }

    if (items.length > 50) {
        throw new Error('Too many cart items in one order.');
    }

    const calculatedItems: CheckoutItemCalculated[] = [];

    for (const item of items) {
        if (!Number.isInteger(item.productId) || item.productId <= 0) {
            throw new Error('Invalid product in cart.');
        }

        if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 25) {
            throw new Error('Invalid quantity in cart.');
        }

        const product = productMap.get(item.productId);
        if (!product) {
            throw new Error(`Product ${item.productId} is not available.`);
        }

        calculatedItems.push({
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: product.unitPrice,
            lineTotal: product.unitPrice * item.quantity,
        });
    }

    const subtotal = calculatedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const deliveryFee = 0;
    const total = subtotal + deliveryFee;

    return {
        items: calculatedItems,
        subtotal,
        deliveryFee,
        total,
        totalPaise: Math.round(total * 100),
    };
}
