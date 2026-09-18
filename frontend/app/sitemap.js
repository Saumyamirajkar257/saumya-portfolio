import { SITE_URL } from "@/lib/site";
export const dynamic = "force-static";

export default function sitemap() {
  const routes = ["", "#about", "#skills", "#projects", "#experience", "#education", "#certifications", "#contact"];

  return routes.map((route) => ({
    url: `${SITE_URL}/${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1.0 : 0.7,
  }));
}