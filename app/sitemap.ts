import type { MetadataRoute } from "next";

const BASE = "https://www.alpskasola.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const strani = [
    "",
    "/sola-smucanja",
    "/plavalni-tecaj",
    "/sportna-abeceda",
    "/smucarska-akademija",
    "/ski-racing-team",
    "/sola-rolanja",
    "/praznovanje-rojstnega-dne",
    "/servis",
    "/izposoja-opreme",
    "/o-nas",
    "/prijava",
  ];
  return strani.map((pot) => ({
    url: `${BASE}${pot}`,
    lastModified: new Date(),
    changeFrequency: pot === "" ? "weekly" : "monthly",
    priority: pot === "" ? 1 : 0.8,
  }));
}
