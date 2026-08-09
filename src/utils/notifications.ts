import { supabase } from '../lib/supabase';
import { NotificationItem, NotificationPreferences } from '../types';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'me',
    type: 'message',
    title: 'New Message from Fr. Seraphim Rose',
    body: 'Christ is in our midst! Thank you for inquiring about the Lenten Vespers schedule.',
    link: 'messages',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    senderName: 'Fr. Seraphim Rose',
    senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'notif-2',
    userId: 'me',
    type: 'event_invite',
    title: 'Parish Event Invitation',
    body: 'Eleni Chrysostom invited you to "Festal Hierarchical Divine Liturgy & Panagia Blessing".',
    link: 'calendar',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    senderName: 'Eleni Chrysostom',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'notif-3',
    userId: 'me',
    type: 'mention',
    title: 'Mentioned in a Reflection',
    body: 'Deacon Markos Haddad tagged you in a quote from St. Isaac the Syrian.',
    link: 'feed',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 3600 * 5).toISOString(),
    senderName: 'Deacon Markos',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'notif-4',
    userId: 'me',
    type: 'group_invite',
    title: 'Group Room Invitation',
    body: 'You were invited to join "Orthodox Bible Study & Scripture Commentary".',
    link: 'myNetwork',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
    senderName: 'Anna Papadopoulos',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  },
];

const DEFAULT_PREFERENCES: NotificationPreferences = {
  messages: true,
  mentions: true,
  groupInvites: true,
  eventInvites: true,
  moderationAlerts: true,
  emailAlerts: false,
};

let localNotifsCache: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

export async function loadNotifications(userId: string = 'me'): Promise<NotificationItem[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},user_id.eq.me`)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const dbNotifs: NotificationItem[] = data.map((d: any) => ({
        id: String(d.id),
        userId: d.user_id,
        type: d.type || 'system',
        title: d.title,
        body: d.body || '',
        link: d.link || undefined,
        isRead: d.is_read ?? false,
        createdAt: d.created_at || new Date().toISOString(),
        senderName: d.sender_name || undefined,
        senderAvatar: d.sender_avatar || undefined,
      }));

      // Merge
      const map = new Map<string, NotificationItem>();
      dbNotifs.forEach((n) => map.set(n.id, n));
      localNotifsCache.forEach((n) => {
        if (!map.has(n.id)) map.set(n.id, n);
      });

      return Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (err) {
    console.warn('Supabase notifications fallback to cache:', err);
  }

  return localNotifsCache;
}

export async function addNotification(
  notif: Partial<NotificationItem>
): Promise<NotificationItem> {
  const item: NotificationItem = {
    id: notif.id || 'notif-' + Date.now(),
    userId: notif.userId || 'me',
    type: notif.type || 'system',
    title: notif.title || 'Notification',
    body: notif.body || '',
    link: notif.link,
    isRead: false,
    createdAt: new Date().toISOString(),
    senderName: notif.senderName,
    senderAvatar: notif.senderAvatar,
  };

  localNotifsCache = [item, ...localNotifsCache];

  try {
    await supabase.from('notifications').insert([
      {
        user_id: item.userId,
        type: item.type,
        title: item.title,
        body: item.body,
        link: item.link || null,
        is_read: false,
        sender_name: item.senderName || null,
        sender_avatar: item.senderAvatar || null,
      },
    ]);
  } catch (err) {
    console.warn('Insert notification warning:', err);
  }

  return item;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  localNotifsCache = localNotifsCache.map((n) => (n.id === id ? { ...n, isRead: true } : n));

  try {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  } catch (err) {
    console.warn('Mark as read error:', err);
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  localNotifsCache = localNotifsCache.map((n) => ({ ...n, isRead: true }));

  try {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
  } catch (err) {
    console.warn('Mark all as read error:', err);
  }
}

export async function deleteNotification(id: string): Promise<void> {
  localNotifsCache = localNotifsCache.filter((n) => n.id !== id);

  try {
    await supabase.from('notifications').delete().eq('id', id);
  } catch (err) {
    console.warn('Delete notification error:', err);
  }
}

export function loadNotificationPreferences(): NotificationPreferences {
  try {
    const saved = localStorage.getItem('oc_notif_prefs');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // Ignore
  }
  return DEFAULT_PREFERENCES;
}

export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  try {
    localStorage.setItem('oc_notif_prefs', JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to save preferences:', e);
  }
}
