import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { createMomoPayment } from "@/backend/controllers/paymentControllers";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.post(createMomoPayment);

export async function POST(request: NextRequest, ctx: RequestContext) {
    return router.run(request, ctx);
}
