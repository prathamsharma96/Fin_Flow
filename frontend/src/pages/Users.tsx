import { useEffect, useState } from "react";
import { usersApi } from "../api";
import {
  RoleBadge,
  Spinner,
  EmptyState,
  PageHeader,
  formatDate,
} from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function Users() {
  const { isAdmin, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    usersApi
      .getAll()
      .then((res) => setUsers(res.data.data))
      .finally(() => setLoading(false));
  }, [isAdmin, navigate]);

  const toggleActive = async (u: User) => {
    if (u.id === currentUser?.id)
      return alert("You can't deactivate yourself.");
    await usersApi.update(u.id, { isActive: !u.isActive });
    setUsers((prev) =>
      prev.map((x: User) =>
        x.id === u.id ? { ...x, isActive: !u.isActive } : x,
      ),
    );
  };

  const changeRole = async (u: User, role: string) => {
    if (u.id === currentUser?.id)
      return alert("You can't change your own role.");
    await usersApi.update(u.id, { role });
    setUsers((prev) =>
      prev.map((x: User) => (x.id === u.id ? { ...x, role } : x)),
    );
  };

  return (
    <div className="p-8">
      <PageHeader
        title="User management"
        subtitle={`${users.length} total users`}
      />

      <div className="card">
        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-500">
                {["User", "Email", "Role", "Status", "Joined", "Actions"].map(
                  (h: string) => (
                    <th
                      key={h}
                      className="text-xs font-medium text-slate-500 text-left pb-3 pr-4 last:text-right"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-dark-600 last:border-0 hover:bg-dark-600/40 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-950 flex items-center justify-center text-xs font-semibold text-indigo-400 flex-shrink-0">
                        {u.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <span className="text-slate-300 font-medium">
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-500">{u.email}</td>
                  <td className="py-3 pr-4">
                    {u.id === currentUser?.id ? (
                      <RoleBadge role={u.role} />
                    ) : (
                      <select
                        className="bg-dark-600 border border-dark-500 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
                        value={u.role}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          changeRole(u, e.target.value)
                        }
                      >
                        {["VIEWER", "ANALYST", "ADMIN"].map((r: string) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${u.isActive ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-500"}`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="py-3 text-right">
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => toggleActive(u)}
                        className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                          u.isActive
                            ? "border-red-900 text-red-400 hover:bg-red-950"
                            : "border-emerald-900 text-emerald-400 hover:bg-emerald-950"
                        }`}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
