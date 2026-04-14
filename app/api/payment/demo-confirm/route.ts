import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { fakeConfirmPayment } from "@/backend/controllers/demoPaymentControllers";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.post(fakeConfirmPayment);

export async function POST(request: NextRequest, ctx: RequestContext) {
    return router.run(request, ctx);
}
