import { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/services/woocommerce";
import { SITE_CONFIG } from "@/lib/constants";

export const revalidate = 3600; // 1 hour revalidation

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  // Fetch products & categories with essential fields for XML Image Sitemap compliance
  const [productsRes, categoriesList] = await Promise.all([
    getProducts({ perPage: 50 }).catch(() => ({ data: [] })),
    getCategories().catch(() => []),
  ]);

  const staticPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${baseUrl}/shop`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${baseUrl}/about`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/contact`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/shipping-policy`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/refund-policy`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/privacy-policy`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/terms`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/faq`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/track-order`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/sitemap-page`, priority: 0.6, changeFrequency: "weekly" as const },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categoriesList.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
    images: cat.image?.src ? [cat.image.src] : [],
  }));

  const productRoutes: MetadataRoute.Sitemap = productsRes.data.map((prod) => ({
    url: `${baseUrl}/products/${prod.slug}`,
    lastModified: new Date(prod.date_modified || prod.date_created || Date.now()),
    changeFrequency: "daily" as const,
    priority: 0.9,
    images: prod.images.map((img) => img.src).filter(Boolean),
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

