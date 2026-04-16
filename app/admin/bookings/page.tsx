import Error from "@/app/error";
import AllBookings from "@/components/admin/AllBookings";
import { getAuthHeader } from "@/helpers/authHeader";

export const metadata = {
  title: "All Bookings - ADMIN",
};

const getBookings = async () => {
  const authHeaders = getAuthHeader();

  const res = await fetch(`${process.env.API_URL}/api/admin/bookings`, {
    headers: authHeaders.headers,
    cache: "no-cache",
  });

  return res.json();
};

export default async function AdminBookingsPage() {
  const data = await getBookings();

  if (data?.errMessage) {
    return <Error error={data} />;
  }

  return <AllBookings data={data} />;
}
