import { handleIpnCallback } from "@/lib/payment/callback-proxy";

export async function POST(request: Request) {
  return handleIpnCallback(request);
}
