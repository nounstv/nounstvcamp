import metaConfig from "@/metadata-config";

// /robots.txt — libera tudo que é conteúdo; rotas de API e o editor de
// propostas (/new) não têm valor para busca.
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/new/"] }],
    sitemap: `${metaConfig.canonicalAppBasename}/sitemap.xml`,
  };
}
