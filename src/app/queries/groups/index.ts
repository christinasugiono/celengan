import { db } from "@/lib/db";
import { groupMembers, groups } from "@/lib/db/schema";
import { profiles } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { eq, desc } from "drizzle-orm";

export const getGroups = async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user's profile to check activeGroupId
  const [userProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  // Get user's groups
  const userGroups = await db
    .select({
      id: groups.id,
      name: groups.name,
      defaultCurrency: groups.defaultCurrency,
      createdAt: groups.createdAt,
    })
    .from(groups)
    .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.profileId, user.id))
    .orderBy(desc(groups.createdAt));

  // Mark which group is active
  const groupsWithActive = userGroups.map((group) => ({
    ...group,
    isActive: group.id === userProfile?.activeGroupId,
  }));

  return {
    groups: groupsWithActive,
    activeGroupId: userProfile?.activeGroupId || null,
  };
};
