import { handleFailureCallback } from "@/lib/payment/callback-proxy";

export async function POST(request: Request) {
  return handleFailureCallback(request, "fail");
}
