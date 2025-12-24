import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { createSalesChannelWorkflow } from "../workflows/create-sales-channel"

export default async function handleUserCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { result } = await createSalesChannelWorkflow(container)
    .run()

  console.log(result)
}

export const config: SubscriberConfig = {
  event: "user.created",
}
