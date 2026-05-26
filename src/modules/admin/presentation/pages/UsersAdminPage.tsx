import { useEffect, useState, useMemo } from 'react';
import { Input, Chip, Avatar } from '@nextui-org/react';
import { useUsersStore } from '../../../users/application/users.store';

type RoleFilter = 'all' | 'admin' | 'client';

export default function UsersAdminPage() {
  const { users, isLoading, fetchUsers } = useUsersStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Filtered users
  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter !== 'all') {
      const roleValue = roleFilter === 'client' ? 'comprador' : roleFilter;
      list = list.filter((u) => u.roleName === roleValue);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, roleFilter, search]);

  // Summary metrics
  const totalUsers = users.length;
  const totalClients = users.filter((u) => u.roleName === 'comprador').length;
  const totalPoints = users.reduce((sum, u) => sum + (u.points ?? 0), 0);

  // Helpers
  const getInitials = (name: string, lastName: string) =>
    `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div id="users-admin-page" className="flex flex-col gap-6 animate-appearance-in">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Usuarios
        </h1>
        <p className="text-sm text-default-400 mt-1">
          {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
          }
          value={totalUsers}
          label="Usuarios totales"
        />

        <SummaryCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          }
          value={totalClients}
          label="Clientes registrados"
        />

        <SummaryCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          }
          value={totalPoints}
          label="Puntos totales"
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Input
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="bordered"
          classNames={{ inputWrapper: 'border-default-200' }}
          startContent={
            <svg className="text-default-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          }
          className="max-w-xs"
        />
        <div className="flex gap-2">
          {([
            { key: 'all' as RoleFilter, label: 'Todos' },
            {
              key: 'admin' as RoleFilter, label: 'Admin', icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              )
            },
            {
              key: 'client' as RoleFilter, label: 'Compradores', icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              )
            },
          ]).map((f) => (
            <Chip
              key={f.key}
              variant={roleFilter === f.key ? 'solid' : 'bordered'}
              color={roleFilter === f.key ? 'primary' : 'default'}
              className="cursor-pointer"
              onClick={() => setRoleFilter(f.key)}
              startContent={f.icon}
            >
              {f.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-content1 border border-default-200/50 rounded-2xl overflow-hidden shadow-sm">
        {isLoading && users.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12 text-default-500 text-sm">
            <div className="loader-moon" /><p>Cargando usuarios...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-default-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
            <p className="text-sm">{search ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-default-50 border-b border-default-200/50">
                  <th className="px-6 py-4 text-xs font-semibold text-default-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-xs font-semibold text-default-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-default-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-xs font-semibold text-default-500 uppercase tracking-wider">Puntos</th>
                  <th className="px-6 py-4 text-xs font-semibold text-default-500 uppercase tracking-wider">Registro</th>
                  <th className="px-6 py-4 text-xs font-semibold text-default-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default-200/50">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-default-50/50 transition-colors">
                    {/* Avatar + Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={getInitials(user.name, user.lastName)}
                          size="sm"
                          classNames={{
                            base: user.roleName === 'admin'
                              ? 'bg-gradient-to-br from-primary to-green-400 text-background text-xs font-bold'
                              : 'bg-gradient-to-br from-emerald-700 to-teal-500 text-white text-xs font-bold',
                          }}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {user.name} {user.lastName}
                        </span>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-default-400">{user.email}</span>
                    </td>
                    {/* Role */}
                    <td className="px-6 py-4">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={user.roleName === 'admin' ? 'warning' : 'primary'}
                        startContent={
                          user.roleName === 'admin' ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                          )
                        }
                      >
                        {user.roleName === 'admin' ? 'Admin' : 'Cliente'}
                      </Chip>
                    </td>
                    {/* Points */}
                    <td className="px-6 py-4">
                      {user.roleName === 'admin' ? (
                        <span className="text-sm text-default-400">--</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                          </svg>
                          <span className="text-sm font-medium text-foreground">{user.points ?? 0}</span>
                        </div>
                      )}
                    </td>
                    {/* Created At */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-default-400">{formatDate(user.createdAt)}</span>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-xs text-green-400 font-medium">Activo</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/** Summary card component */
function SummaryCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-default-200/50 bg-content1">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-default-400">{label}</p>
      </div>
    </div>
  );
}
