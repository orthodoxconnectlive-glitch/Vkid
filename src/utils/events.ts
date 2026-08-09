import { supabase } from '../lib/supabase';
import { EventItem, EventRsvp } from '../types';

const SEED_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Hierarchical Divine Liturgy & Panagia Blessing',
    description: 'Festal Hierarchical Divine Liturgy celebrated for the Feast of the Dormition, followed by blessing of herbs and parish agape meal.',
    date: '2026-08-15',
    time: '09:00 AM',
    locationType: 'physical',
    locationAddress: 'Holy Trinity Cathedral, 450 Harvard St, Boston, MA',
    category: 'liturgy',
    parish: 'Holy Trinity Cathedral',
    hostName: 'Fr. Nicholas Vasileiou',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-195fe5772323?auto=format&fit=crop&q=80&w=1200',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    goingCount: 48,
    interestedCount: 22,
    rsvps: [
      {
        userId: 'usr-1',
        userName: 'Eleni Chrysostom',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        status: 'going',
        createdAt: new Date().toISOString(),
      },
      {
        userId: 'usr-2',
        userName: 'Deacon Markos',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        status: 'going',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'evt-2',
    title: 'Orthodox Youth Fellowship & Mountain Retreat',
    description: 'A 3-day spiritual pilgrimage and camping trip for youth & young adults featuring outdoor vespers, discussions on Patristic theology, and hiking.',
    date: '2026-08-22',
    time: '04:00 PM',
    locationType: 'physical',
    locationAddress: 'St. Herman Wilderness Retreat Grounds, NH',
    category: 'pilgrimage',
    parish: 'St. Herman Monastery',
    hostName: 'Fr. Seraphim Rose',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1200',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    goingCount: 35,
    interestedCount: 19,
    rsvps: [],
  },
  {
    id: 'evt-3',
    title: 'Online Gospel Study: Gospel of St. John & Chrysostom Commentary',
    description: 'Join us live on Zoom for our weekly verse-by-verse scripture analysis with Father Gabriel Haddad.',
    date: '2026-08-18',
    time: '07:30 PM',
    locationType: 'virtual',
    virtualLink: 'https://orthodoxconnect.live/room-bible',
    category: 'bible_study',
    parish: 'St. George Antiochian Cathedral',
    hostName: 'Fr. Gabriel Haddad',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    goingCount: 62,
    interestedCount: 30,
    rsvps: [],
  },
];

let localEventsCache: EventItem[] = [...SEED_EVENTS];

export async function loadEvents(): Promise<EventItem[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (!error && data && data.length > 0) {
      const dbEvents: EventItem[] = data.map((d: any) => ({
        id: String(d.id),
        title: d.title,
        description: d.description || '',
        date: d.date,
        time: d.time || '10:00 AM',
        locationType: d.location_type || 'physical',
        locationAddress: d.location_address || undefined,
        virtualLink: d.virtual_link || undefined,
        category: d.category || 'liturgy',
        parish: d.parish || 'Orthodox Parish',
        hostName: d.host_name || 'Priest / Coordinator',
        hostAvatar: d.host_avatar || undefined,
        hostId: d.host_id || undefined,
        imageUrl: d.image_url || undefined,
        createdAt: d.created_at || new Date().toISOString(),
        goingCount: d.going_count || 1,
        interestedCount: d.interested_count || 0,
        rsvps: d.rsvps || [],
      }));

      // Merge with local cache
      const map = new Map<string, EventItem>();
      dbEvents.forEach((e) => map.set(e.id, e));
      localEventsCache.forEach((e) => {
        if (!map.has(e.id)) map.set(e.id, e);
      });

      return Array.from(map.values());
    }
  } catch (err) {
    console.warn('Supabase loadEvents fallback to local cache:', err);
  }

  return localEventsCache;
}

export async function saveEvent(newEventData: Partial<EventItem>): Promise<EventItem> {
  const created: EventItem = {
    id: newEventData.id || 'evt-' + Date.now(),
    title: newEventData.title || 'Parish Event',
    description: newEventData.description || '',
    date: newEventData.date || new Date().toISOString().split('T')[0],
    time: newEventData.time || '10:00 AM',
    locationType: newEventData.locationType || 'physical',
    locationAddress: newEventData.locationAddress,
    virtualLink: newEventData.virtualLink,
    category: newEventData.category || 'liturgy',
    parish: newEventData.parish || 'Holy Trinity Cathedral',
    hostName: newEventData.hostName || 'Fr. Seraphim Rose',
    hostAvatar: newEventData.hostAvatar,
    hostId: newEventData.hostId,
    imageUrl: newEventData.imageUrl || 'https://images.unsplash.com/photo-1548625361-195fe5772323?auto=format&fit=crop&q=80&w=1200',
    createdAt: new Date().toISOString(),
    goingCount: 1,
    interestedCount: 0,
    rsvps: [
      {
        userId: newEventData.hostId || 'me',
        userName: newEventData.hostName || 'You (Host)',
        userAvatar: newEventData.hostAvatar,
        status: 'going',
        createdAt: new Date().toISOString(),
      },
    ],
  };

  localEventsCache = [created, ...localEventsCache];

  try {
    const payload = {
      title: created.title,
      description: created.description,
      date: created.date,
      time: created.time,
      location_type: created.locationType,
      location_address: created.locationAddress || null,
      virtual_link: created.virtualLink || null,
      category: created.category,
      parish: created.parish,
      host_name: created.hostName,
      host_avatar: created.hostAvatar || null,
      host_id: created.hostId || null,
      image_url: created.imageUrl || null,
      going_count: created.goingCount,
      interested_count: created.interestedCount,
      rsvps: created.rsvps,
    };

    await supabase.from('events').insert([payload]);
  } catch (err) {
    console.warn('Save event error:', err);
  }

  return created;
}

export async function setEventRsvp(
  eventId: string,
  user: { id: string; name: string; avatar?: string },
  status: 'going' | 'interested' | 'not_going'
): Promise<EventItem | null> {
  let updatedEvent: EventItem | null = null;

  localEventsCache = localEventsCache.map((event) => {
    if (event.id !== eventId) return event;

    const existingRsvps = event.rsvps || [];
    const prevRsvp = existingRsvps.find((r) => r.userId === user.id);
    const filteredRsvps = existingRsvps.filter((r) => r.userId !== user.id);

    let going = event.goingCount;
    let interested = event.interestedCount;

    if (prevRsvp) {
      if (prevRsvp.status === 'going') going = Math.max(0, going - 1);
      if (prevRsvp.status === 'interested') interested = Math.max(0, interested - 1);
    }

    if (status === 'going') going += 1;
    if (status === 'interested') interested += 1;

    const newRsvpList: EventRsvp[] = [
      ...filteredRsvps,
      {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        status,
        createdAt: new Date().toISOString(),
      },
    ];

    updatedEvent = {
      ...event,
      rsvps: newRsvpList,
      userRsvpStatus: status,
      goingCount: going,
      interestedCount: interested,
    };

    return updatedEvent;
  });

  if (updatedEvent) {
    try {
      await supabase
        .from('events')
        .update({
          going_count: (updatedEvent as EventItem).goingCount,
          interested_count: (updatedEvent as EventItem).interestedCount,
          rsvps: (updatedEvent as EventItem).rsvps,
        })
        .eq('id', eventId);
    } catch (err) {
      console.warn('Update RSVP warning:', err);
    }
  }

  return updatedEvent;
}
