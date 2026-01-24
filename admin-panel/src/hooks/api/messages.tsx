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

export const useRocketChat = () => {
  // Always fetch from API to get login token
  const { data: rocketChat, isLoading } = useQuery({
    queryKey: ["rocket-chat"],
    queryFn: () =>
      fetch("/admin/rocketchat", {
        credentials: "include", // Include auth cookies
      })
        .then((res) => res.json())
        .catch((err) => ({
          configured: false,
          message: err,
        })),
  });

  return {
    isConfigured: rocketChat?.configured ?? false,
    rocketChatUrl: rocketChat?.url ?? null,
    iframeUrl: rocketChat?.iframe_url ?? null,
    loginToken: rocketChat?.login?.token ?? null,
    username: rocketChat?.login?.username ?? null,
    isLoading,
  };
};
