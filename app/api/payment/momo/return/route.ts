import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { momoReturnCallback } from "@/backend/controllers/paymentControllers";

interface RequestContext { }

const router = createEdgeRouter<NextRequest, RequestContext>();

// MoMo redirects users back here via GET
router.get(momoReturnCallback);

export async function GET(request: NextRequest, ctx: RequestContext) {
    return router.run(request, ctx);
}
