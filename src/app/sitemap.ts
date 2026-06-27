import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dreamdaypartners-production.up.railway.app";

  const vendors = await prisma.vendor.findMany({ select: { id: true, updatedAt: true } });

  const vendorUrls = vendors.map((v) => ({
    url: `${baseUrl}/leveranciers/${v.id}`,
    lastModified: v.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/leveranciers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/aanmelden`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    ...vendorUrls,
  ];
}
