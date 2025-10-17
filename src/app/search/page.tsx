import { redirect } from "next/navigation";
import UserSearch from "@/components/search/UserSearch";
import { getAuthenticatedUserId } from "@/helpers/auth/user";

export default async function Page() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return redirect("/login");

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Find users</h1>
      <p className="text-sm text-gray-600 mb-4">
        Search for other users by their anonName. Only anonName is shown.
      </p>
      <div className="bg-white shadow rounded p-4">
        <UserSearch />
      </div>
    </main>
  );
}
