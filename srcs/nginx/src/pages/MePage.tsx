import { useCallback, useEffect, useState } from "react"
import { UserProfileDTO } from "../schemas/profile.schema"
import { UserProfile } from "../components/UserProfile";

export const MePage = () => {
  const [user, setUser] = useState<UserProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = {
        username: "toto",
        avatarUrl: "default.png"
      };
      setUser(data);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-12 w-12 rounded-full bg-slate-800 animate-pulse"></div>
        <div className="h-4 w-40 bg-slate-800 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-red-400">Unable to load your profile</p>
        <p className="text=xs text-slate-400">{error}</p>
        <button className="px-3 py-1"></button>
      </div>
    )
  }

  if (!user) return null;

  return (
    <section className="space-y-4">
      <h1 className="text-xl fomnt-semibold"></h1>
      <UserProfile user={user}></UserProfile>
    </section>
  )

}