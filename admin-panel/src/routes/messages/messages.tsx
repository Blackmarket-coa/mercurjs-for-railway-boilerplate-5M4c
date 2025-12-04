import { useCallback } from "react";

import { Container, Heading, Label } from "@medusajs/ui";

import { Inbox, Session } from "@talkjs/react";
import Talk from "talkjs";

import { useTalkJS } from "@hooks/api/messages";

// const TALK_JS_APP_ID = import.meta.env.DEV ? import.meta.env.VITE_TALK_JS_APP_ID || "" : process.env.VITE_TALK_JS_APP_ID || ""

export const Messages = () => {
  const { app_id, isLoading } = useTalkJS();

  const syncUser = useCallback(
    () =>
      new Talk.User({
        id: "admin",
        name: "Admin",
      }),
    [],
  );

  return (
    <Container>
      <Heading>Messages</Heading>
      <div className="h-[600px] py-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            Loading...
          </div>
        ) : app_id ? (
          <Session appId={app_id} syncUser={syncUser}>
            <Inbox className="h-full" />
          </Session>
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <Heading>No TalkJS App ID</Heading>
            <Label className="mt-4">
              Please set the TALK_JS_APP_ID environment variable
            </Label>
          </div>
        )}
      </div>
    </Container>
  );
};
