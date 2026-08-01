import { handleSuccessCallback } from "@/lib/payment/callback-proxy";

export async function POST(request: Request) {
  return handleSuccessCallback(request);
}
