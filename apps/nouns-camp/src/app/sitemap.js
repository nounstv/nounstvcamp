import metaConfig from "@/metadata-config";
import { makeUrlId as makeCandidateUrlId } from "@/utils/candidates";

// /sitemap.xml — páginas fixas + todas as propostas e candidatas (não
// canceladas) lidas do subgraph. Regenerado a cada hora.
export const revalidate = 3600;

const PAGE_SIZE = 1000;

const subgraphFetch = async (query, variables) => {
  const res = await fetch(process.env.NOUNS_SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`subgraph ${res.status}`);
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors[0].message);
  return data;
};

const fetchAll = async (field, fields, where = "") => {
  const items = [];
  for (let skip = 0; ; skip += PAGE_SIZE) {
    const data = await subgraphFetch(
      `query ($first: Int!, $skip: Int!) {
        ${field}(first: $first, skip: $skip, orderBy: createdTimestamp, orderDirection: asc${where}) { ${fields} }
      }`,
      { first: PAGE_SIZE, skip },
    );
    const page = data[field] ?? [];
    items.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return items;
};

const toDate = (timestamp) =>
  timestamp == null ? undefined : new Date(Number(timestamp) * 1000);

export default async function sitemap() {
  const base = metaConfig.canonicalAppBasename;

  const staticEntries = [
    { path: "/", changeFrequency: "hourly", priority: 1 },
    { path: "/proposals", changeFrequency: "hourly", priority: 0.9 },
    { path: "/candidates", changeFrequency: "hourly", priority: 0.8 },
    { path: "/topics", changeFrequency: "daily", priority: 0.6 },
    { path: "/voters", changeFrequency: "daily", priority: 0.6 },
    { path: "/auction", changeFrequency: "hourly", priority: 0.7 },
  ].map(({ path, ...rest }) => ({ url: `${base}${path}`, ...rest }));

  let proposalEntries = [];
  let candidateEntries = [];

  try {
    const [proposals, candidates] = await Promise.all([
      fetchAll("proposals", "id lastUpdatedTimestamp createdTimestamp"),
      fetchAll(
        "proposalCandidates",
        "id lastUpdatedTimestamp createdTimestamp",
        ", where: { canceled: false }",
      ),
    ]);

    proposalEntries = proposals.map((p) => ({
      url: `${base}/proposals/${p.id}`,
      lastModified: toDate(p.lastUpdatedTimestamp ?? p.createdTimestamp),
      changeFrequency: "daily",
      priority: 0.7,
    }));

    candidateEntries = candidates.map((c) => ({
      url: `${base}/candidates/${makeCandidateUrlId(c.id)}`,
      lastModified: toDate(c.lastUpdatedTimestamp ?? c.createdTimestamp),
      changeFrequency: "weekly",
      priority: 0.5,
    }));
  } catch (e) {
    console.error("sitemap: subgraph indisponível, só páginas fixas", e);
  }

  return [...staticEntries, ...proposalEntries, ...candidateEntries];
}
