// Resumo em áudio da proposta, gerado pela Nouns TV News (nounstvnewsapi).
// Proxy server-side: evita expor a API da news no cliente e permite cache.

const NEWS_API_URL = (
  process.env.NOUNS_TV_NEWS_API_URL ?? "https://newsapi.nounstv.com"
).replace(/\/$/, "");
const NEWS_SITE_URL = "https://news.nounstv.com";
const REVALIDATE_SECONDS = 10 * 60;

const isValidAudioUrl = (url) =>
  typeof url === "string" &&
  url !== "none" &&
  url !== "failed" &&
  (url.startsWith("/audio/") || url.startsWith("http"));

const toAbsoluteUrl = (url) =>
  url.startsWith("http") ? url : `${NEWS_API_URL}${url}`;

const fetchProposalArticle = async (proposalId) => {
  const base = `${NEWS_API_URL}/api/news/dao-proposals?source=NOUNS%20DAO%20NEWS`;
  const matches = (a) => Number(a?.proposalId) === proposalId;

  // 1) filtro por proposalId (suportado pela news API a partir de nov/2026)
  const direct = await fetch(`${base}&proposalId=${proposalId}&limit=1`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (direct.ok) {
    const json = await direct.json();
    const article = (json?.data ?? []).find(matches);
    if (article != null) return article;
  }

  // 2) fallback: lista completa (cacheada) e busca local
  const all = await fetch(`${base}&limit=0`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!all.ok) return null;
  const json = await all.json();
  return (json?.data ?? []).find(matches) ?? null;
};

export async function GET(_request, { params }) {
  const { proposalId: rawId } = await params;
  const proposalId = Number(rawId);
  if (!Number.isInteger(proposalId) || proposalId <= 0)
    return Response.json({ code: "invalid-proposal-id" }, { status: 400 });

  try {
    const article = await fetchProposalArticle(proposalId);

    const body =
      article == null
        ? { proposalId, found: false }
        : {
            proposalId,
            found: true,
            title: article.title ?? null,
            summary: article.summary ?? null,
            audioUrl: isValidAudioUrl(article.audioUrl)
              ? toAbsoluteUrl(article.audioUrl)
              : null,
            newsUrl: `${NEWS_SITE_URL}/?source=nouns&id=${
              article.shortId ?? article._id
            }`,
          };

    return Response.json(body, {
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=${REVALIDATE_SECONDS}`,
      },
    });
  } catch (e) {
    console.error("news-summary", e);
    return Response.json({ code: "upstream-error" }, { status: 502 });
  }
}
