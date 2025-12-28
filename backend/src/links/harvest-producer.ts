import { defineLink } from "@medusajs/framework/utils"
import AgricultureModule from "../modules/agriculture"
import ProducerModule from "../modules/producer"

/**
 * Link Harvest to Producer
 * 
 * Links harvests to their source producer.
 */
export default defineLink(
  {
    linkable: ProducerModule.linkable.producer,
    isList: false,
  },
  {
    linkable: AgricultureModule.linkable.harvest,
    isList: true,
  }
)
