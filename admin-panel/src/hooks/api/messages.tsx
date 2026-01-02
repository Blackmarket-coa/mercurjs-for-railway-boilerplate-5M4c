import { useQuery } from "@tanstack/react-query";

export const useTalkJS = () => {
  const { data: talkJs, isLoading } = useQuery({
    queryKey: ["talk-js"],
    queryFn: () =>
      fetch("/admin/talk-js")
        .then((res) => res.json())
        .catch((err) => ({
          message: err,
        })),
  });

  return { ...talkJs, isLoading };
};

// Get RocketChat URL from environment variable first, fallback to API
const ROCKETCHAT_URL = import.meta.env.VITE_ROCKETCHAT_URL || "";

export const useRocketChat = () => {
  // If we have the URL from env, use it directly without API call
  if (ROCKETCHAT_URL) {
    return {
      isConfigured: true,
      rocketChatUrl: ROCKETCHAT_URL,
      iframeUrl: `${ROCKETCHAT_URL}/home`,
      isLoading: false,
    };
  }

  // Fallback to API call
  const { data: rocketChat, isLoading } = useQuery({
    queryKey: ["rocket-chat"],
    queryFn: () =>
      fetch("/admin/rocketchat")
        .then((res) => res.json())
        .catch((err) => ({
          message: err,
        })),
    enabled: !ROCKETCHAT_URL, // Only fetch if no env var
  });

  return {
    isConfigured: rocketChat?.configured ?? false,
    rocketChatUrl: rocketChat?.url ?? null,
    iframeUrl: rocketChat?.iframe_url ?? null,
    isLoading,
  };
};
