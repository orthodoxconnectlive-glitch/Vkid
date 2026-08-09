const GROUPS_STORAGE_KEY = 'orthodoxconnect_joined_groups';

const DEFAULT_JOINED_GROUPS = ['room-bible', 'room-choir', 'room-youth'];

export function getJoinedGroupIds(): string[] {
  try {
    const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(DEFAULT_JOINED_GROUPS));
      return DEFAULT_JOINED_GROUPS;
    }
    return JSON.parse(raw) as string[];
  } catch {
    return DEFAULT_JOINED_GROUPS;
  }
}

export function isGroupJoined(groupId: string): boolean {
  if (!groupId) return false;
  const joined = getJoinedGroupIds();
  return joined.includes(groupId);
}

export function toggleGroupJoin(groupId: string): boolean {
  if (!groupId) return false;
  const joined = getJoinedGroupIds();
  const index = joined.indexOf(groupId);

  let updated: string[];
  let isNowJoined = false;

  if (index >= 0) {
    updated = joined.filter((id) => id !== groupId);
    isNowJoined = false;
  } else {
    updated = [...joined, groupId];
    isNowJoined = true;
  }

  try {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage group join failed:', err);
  }

  return isNowJoined;
}
