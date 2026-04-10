/**
 * Utility to fetch product information from various sources (currently Open Food Facts).
 */

export interface ScannedProductInfo {
    name: string;
    category: string;
    brand?: string;
    imageUrl?: string;
}

export async function fetchProductInfo(barcode: string): Promise<ScannedProductInfo | null> {
    try {
        const response = await fetch(`/api/lookup?barcode=${barcode}`);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (data.status !== 1) {
            return null;
        }

        const product = data.product;

        return {
            name: product.product_name || product.generic_name || "",
            category: product.categories?.split(',')[0]?.trim() || "General",
            brand: product.brands,
            imageUrl: product.image_url,
        };
    } catch (error) {
        console.error("Error fetching product info:", error);
        return null;
    }
}
