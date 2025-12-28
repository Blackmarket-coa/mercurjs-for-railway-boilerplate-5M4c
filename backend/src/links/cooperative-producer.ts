import { defineLink } from "@medusajs/framework/utils"
import CooperativeModule from "../modules/cooperative"
import ProducerModule from "../modules/producer"

/**
 * Link Cooperative Member to Producer
 * 
 * This link enables querying from cooperative members to producers.
 */
export default defineLink(
  {
    linkable: ProducerModule.linkable.producer,
    isList: false,
  },
  {
    linkable: CooperativeModule.linkable.cooperativeMember,
    isList: true, // A producer can be member of multiple cooperatives
  }
)
