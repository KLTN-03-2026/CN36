import dbConnect from "@/backend/config/dbConnect";
import { getSalesStats } from "@/backend/controllers/bookingControllers";
import { isAuthenticatedUser, authorizeRoles } from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>();

dbConnect();

router.use(isAuthenticatedUser, authorizeRoles("admin", "staff")).get(getSalesStats);

export async function GET(request: NextRequest, ctx: RequestContext) {
  return router.run(request, ctx);
}
