import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Activity, UserCheck, Shield, AlertTriangle, Flag, Trash2, AlertOctagon, Ban, CheckCircle, Clock, Search, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole, ContentReport, ModerationAuditLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { loadContentReports, updateReportStatus, warnUser, setUserBanStatus, loadAuditLogs, getUserModerationStatus } from '../utils/moderation';
import { deletePost } from '../utils/posts';

export const AdminPanelView: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useTheme();

  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'audit'>('reports');
  const [reportsList, setReportsList] = useState<ContentReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<ModerationAuditLog[]>([]);
  const [userStatuses, setUserStatuses] = useState<Record<string, { warningCount: number; isBanned: boolean }>>({});

  const [usersList, setUsersList] = useState<UserProfile[]>([
    {
      id: 'admin-1',
      email: 'fr.seraphim@orthodoxconnect.live',
      full_name: 'Fr. Seraphim Rose',
      parish: 'St. Herman Monastery',
      role: 'owner',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 'admin-2',
      email: 'eleni@orthodoxconnect.live',
      full_name: 'Eleni Chrysostom',
      parish: 'Holy Trinity Cathedral',
      role: 'admin',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 'user-3',
      email: 'markos@orthodoxconnect.live',
      full_name: 'Deacon Markos Haddad',
      parish: 'St. George Antiochian',
      role: 'user',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 'usr-spammer-2',
      email: 'crypto.promoter@orthodoxconnect.live',
      full_name: 'Crypto Spammer',
      parish: 'Unverified Parish',
      role: 'user',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);

    // Fetch registered profiles
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data && data.length > 0) {
        setUsersList(
          data.map((d: any) => ({
            id: d.id,
            email: d.email || 'member@orthodoxconnect.live',
            full_name: d.full_name || 'Orthodox Member',
            parish: d.parish || 'St. George Cathedral',
            role: (d.role as UserRole) || 'user',
            avatar_url: d.avatar_url,
          }))
        );
      }
    } catch (err) {
      console.warn('Admin user list fetch fallback:', err);
    }

    // Fetch moderation content reports
    const reports = await loadContentReports();
    setReportsList(reports);

    // Fetch audit logs
    const logs = await loadAuditLogs();
    setAuditLogs(logs);

    // Load user moderation status
    const statusMap: Record<string, { warningCount: number; isBanned: boolean }> = {};
    for (const u of usersList) {
      const st = await getUserModerationStatus(u.id);
      statusMap[u.id] = { warningCount: st.warningCount, isBanned: st.isBanned };
    }
    setUserStatuses(statusMap);

    setLoading(false);
  };

  const handleRoleToggle = async (userId: string, currentRole: UserRole) => {
    const newRole: UserRole = currentRole === 'admin' ? 'user' : 'admin';

    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    try {
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    } catch (err) {
      console.warn('Role update warning:', err);
    }
  };

  // Moderation Actions
  const handleDismissReport = async (reportId: string) => {
    await updateReportStatus(
      reportId,
      'dismissed',
      { id: profile?.id || 'admin', name: profile?.full_name || 'Admin' },
      'dismiss',
      'Report reviewed and dismissed.'
    );
    setReportsList((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'dismissed' } : r)));
    refreshLogs();
  };

  const handleRemoveContent = async (report: ContentReport) => {
    if (report.targetType === 'post') {
      await deletePost(report.targetId);
    }
    await updateReportStatus(
      report.id,
      'action_taken',
      { id: profile?.id || 'admin', name: profile?.full_name || 'Admin' },
      'remove_content',
      `Removed flagged ${report.targetType} from feed.`
    );
    setReportsList((prev) => prev.map((r) => (r.id === report.id ? { ...r, status: 'action_taken' } : r)));
    refreshLogs();
  };

  const handleWarnUser = async (report: ContentReport) => {
    const targetUserId = report.targetAuthorId || report.targetId;
    const admin = { id: profile?.id || 'admin', name: profile?.full_name || 'Admin' };
    const updatedStatus = await warnUser(targetUserId, admin, `Official warning for ${report.reason}`);

    setUserStatuses((prev) => ({
      ...prev,
      [targetUserId]: { warningCount: updatedStatus.warningCount, isBanned: updatedStatus.isBanned },
    }));

    await updateReportStatus(report.id, 'action_taken', admin, 'warn_user', 'Issued warning to user.');
    setReportsList((prev) => prev.map((r) => (r.id === report.id ? { ...r, status: 'action_taken' } : r)));
    refreshLogs();
  };

  const handleBanUser = async (targetUserId: string, isBanning: boolean) => {
    const admin = { id: profile?.id || 'admin', name: profile?.full_name || 'Admin' };
    const updatedStatus = await setUserBanStatus(targetUserId, isBanning, admin, 'Violation of parish policy.');

    setUserStatuses((prev) => ({
      ...prev,
      [targetUserId]: { warningCount: updatedStatus.warningCount, isBanned: updatedStatus.isBanned },
    }));

    refreshLogs();
  };

  const refreshLogs = async () => {
    const logs = await loadAuditLogs();
    setAuditLogs(logs);
  };

  const isAdminOrOwner = profile?.role === 'admin' || profile?.role === 'owner';

  if (!isAdminOrOwner) {
    return (
      <div className="p-8 text-center bg-[#fdfaf5] rounded-2xl border border-red-500/40 text-red-700 shadow-xl space-y-2">
        <AlertTriangle className="w-10 h-10 mx-auto text-red-600" />
        <h3 className="font-serif font-bold text-lg">Access Restricted</h3>
        <p className="text-xs text-[#8b6b4a]">
          Admin or Owner privileges are required to access the Moderation & Management Panel.
        </p>
      </div>
    );
  }

  const pendingCount = reportsList.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#f1ebd7] via-[#fdfaf5] to-[#f1ebd7] border border-[#d4af37]/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#d4af37] text-white flex items-center justify-center shadow-md">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-[#5a4632]">
              Admin & Content Moderation Panel
            </h2>
            <p className="text-xs text-[#8b6b4a]">
              Review reported posts, enforce community guidelines, manage clergy roles, and audit user logs
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#fdfaf5] border border-[#d4af37]/30 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-red-600">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-[#8b6b4a] uppercase font-bold tracking-wider">
              Pending Reports
            </p>
            <h3 className="font-serif font-bold text-2xl text-[#5a4632]">
              {pendingCount}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#fdfaf5] border border-[#d4af37]/30 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-[#8b6b4a] uppercase font-bold tracking-wider">
              Total Members
            </p>
            <h3 className="font-serif font-bold text-2xl text-[#5a4632]">
              {usersList.length + 142}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#fdfaf5] border border-[#d4af37]/30 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-[#8b6b4a] uppercase font-bold tracking-wider">
              Admins & Clergy
            </p>
            <h3 className="font-serif font-bold text-2xl text-[#5a4632]">
              {usersList.filter((u) => u.role === 'admin' || u.role === 'owner').length}
            </h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-[#d4af37]/20 pb-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-[#d4af37] text-white shadow-md'
              : 'bg-[#fdfaf5] text-[#8b6b4a] hover:bg-[#f1ebd7]'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Content Reports Queue ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-[#d4af37] text-white shadow-md'
              : 'bg-[#fdfaf5] text-[#8b6b4a] hover:bg-[#f1ebd7]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory & Roles</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-[#d4af37] text-white shadow-md'
              : 'bg-[#fdfaf5] text-[#8b6b4a] hover:bg-[#f1ebd7]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Moderation Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: Content Moderation Reports Queue */}
      {activeTab === 'reports' && (
        <div className="bg-[#fdfaf5] border border-[#d4af37]/30 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#5a4632] flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-600" />
            <span>Reported Content Review Queue</span>
          </h3>

          {reportsList.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8b6b4a]">
              No flagged content. Community feed is clean!
            </div>
          ) : (
            <div className="space-y-3">
              {reportsList.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-2xl border shadow-md space-y-3 transition-all ${
                    report.status === 'pending'
                      ? 'bg-[#f1ebd7] border-red-500/40'
                      : 'bg-[#f5f2ed] border-[#d4af37]/20 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] uppercase">
                        {report.targetType}
                      </span>
                      <span className="font-bold text-[#5a4632]">
                        Reason: {report.reason.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8b6b4a]">
                      Reported by {report.reporterName} • {new Date(report.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {report.targetContentPreview && (
                    <div className="p-3 rounded-xl bg-white border border-[#d4af37]/20 text-xs text-[#2c2c2c] italic">
                      "{report.targetContentPreview}"
                    </div>
                  )}

                  {report.details && (
                    <p className="text-xs text-[#8b6b4a]">
                      <span className="font-bold text-[#5a4632]">Reporter Note: </span>
                      {report.details}
                    </p>
                  )}

                  <div className="pt-2 border-t border-[#d4af37]/20 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-[#8b6b4a]">
                      Author: <span className="font-bold text-[#5a4632]">{report.targetAuthorName || 'Unknown User'}</span>
                    </span>

                    {report.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDismissReport(report.id)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#d4af37]/30 text-[#8b6b4a] hover:text-[#5a4632] font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          Dismiss
                        </button>

                        <button
                          onClick={() => handleRemoveContent(report)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Content</span>
                        </button>

                        <button
                          onClick={() => handleWarnUser(report)}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Warn User</span>
                        </button>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                        Status: {report.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: User Directory & Role Management */}
      {activeTab === 'users' && (
        <div className="bg-[#fdfaf5] border border-[#d4af37]/30 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#5a4632] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#d4af37]" />
            <span>Parish User Directory & Moderation Status</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#d4af37]/30 text-[#8b6b4a] uppercase font-bold text-[10px]">
                  <th className="py-3 px-3">Member</th>
                  <th className="py-3 px-3">Parish</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Warnings & Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af37]/20">
                {usersList.map((user) => {
                  const status = userStatuses[user.id] || { warningCount: 0, isBanned: false };

                  return (
                    <tr key={user.id} className="hover:bg-[#f1ebd7]/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                            alt={user.full_name}
                            className="w-8 h-8 rounded-full object-cover border border-[#d4af37]/40"
                          />
                          <div>
                            <p className="font-bold text-[#5a4632]">{user.full_name}</p>
                            <p className="text-[10px] text-[#8b6b4a]">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-[#4a3e31] font-medium">
                        {user.parish}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            user.role === 'owner'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : user.role === 'admin'
                              ? 'bg-[#d4af37]/20 text-[#5a4632] border border-[#d4af37]'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {status.isBanned ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase">
                            Banned
                          </span>
                        ) : (
                          <span className="text-xs text-[#8b6b4a] font-semibold">
                            {status.warningCount > 0 ? (
                              <span className="text-red-600 font-bold">{status.warningCount} Warnings</span>
                            ) : (
                              'Good Standing'
                            )}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right flex items-center justify-end gap-2">
                        {user.role !== 'owner' && (
                          <>
                            <button
                              onClick={() => handleRoleToggle(user.id, user.role)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                user.role === 'admin'
                                  ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                                  : 'bg-[#d4af37] text-white hover:bg-[#b89528]'
                              }`}
                            >
                              {user.role === 'admin' ? t('demoteUser') : t('promoteAdmin')}
                            </button>

                            <button
                              onClick={() => handleBanUser(user.id, !status.isBanned)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                status.isBanned
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              {status.isBanned ? 'Unban User' : 'Ban User'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Moderation Audit Log Trail */}
      {activeTab === 'audit' && (
        <div className="bg-[#fdfaf5] border border-[#d4af37]/30 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#5a4632] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#d4af37]" />
            <span>Moderation Audit Trail Log</span>
          </h3>

          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8b6b4a]">
                No moderation logs recorded yet.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[#f5f2ed] border border-[#d4af37]/20 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#5a4632]">{log.adminName} </span>
                    <span className="text-[#8b6b4a]">performed </span>
                    <span className="font-bold text-red-600 uppercase">[{log.action.replace('_', ' ')}] </span>
                    <p className="text-[11px] text-[#4a3e31] mt-0.5">{log.reason}</p>
                  </div>
                  <span className="text-[10px] text-[#8b6b4a] shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
