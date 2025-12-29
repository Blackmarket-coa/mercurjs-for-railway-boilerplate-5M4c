import { useQuery } from "@tanstack/react-query"
import { fetchQuery } from "../../lib/client"

export const useRocketChatConfig = () => {
  const { data, ...rest } = useQuery({
    queryKey: ["rocketchat-config"],
    queryFn: async () => await fetchQuery(`/vendor/rocketchat`, { method: "GET" }),
  })

  return {
    isConfigured: data?.configured ?? false,
    rocketChatUrl: data?.url ?? null,
    iframeUrl: data?.iframe_url ?? null,
    ...rest
  }
}
