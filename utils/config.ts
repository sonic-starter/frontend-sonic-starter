"server only"

import { PinataSDK } from "pinata";
import config from "@/config/config";

export const pinata = new PinataSDK({
  pinataJwt: `${config.PINATA_JWT}`,
  pinataGateway: `${config.NEXT_PUBLIC_GATEWAY_URL}`
})
