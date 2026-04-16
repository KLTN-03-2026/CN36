import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { momoIpnCallback } from "@/backend/controllers/paymentControllers";

interface RequestContext { }

const router = createEdgeRouter<NextRequest, RequestContext>();

// MoMo calls our webhook via POST
router.post(momoIpnCallback);

export async function POST(request: NextRequest, ctx: RequestContext) {
    return router.run(request, ctx);
}
