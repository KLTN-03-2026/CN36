import Error from "@/app/error";
import UpdateUser from "@/components/admin/UpdateUser";
import { getAuthHeader } from "@/helpers/authHeader";

export const metadata = {
  title: "Update User - ADMIN",
};

const getUser = async (id: string) => {
  const authHeaders = getAuthHeader();

  const res = await fetch(`${process.env.API_URL}/api/admin/users/${id}`, {
    headers: authHeaders.headers,
    cache: "no-cache",
  });

  return res.json();
};

export default async function AdminUpdateUserPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getUser(params?.id);

  if (data?.errMessage) {
    return <Error error={data} />;
  }

  return <UpdateUser data={data} />;
}
