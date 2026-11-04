import { useQuery } from "@tanstack/react-query";

const useProposalAudioSummary = (proposalId, { enabled = true } = {}) =>
  useQuery({
    queryKey: ["proposal-audio-summary", proposalId],
    queryFn: async () => {
      const res = await fetch(`/api/news-summary/${proposalId}`);
      if (!res.ok) throw new Error(`news-summary ${res.status}`);
      return res.json();
    },
    enabled: enabled && proposalId != null,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

export default useProposalAudioSummary;
