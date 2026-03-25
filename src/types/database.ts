export type RankTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export type ChallengeCategory = "COUNTRY" | "WONDER" | "HIDDEN_GEM" | "MAGIC_TOWN";

export type FriendshipStatus = "PENDING" | "ACCEPTED" | "BLOCKED";

export interface UserProfile {
  id: string;
  auth_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  total_points: number;
  rank: RankTier;
  current_streak: number;
  longest_streak: number;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string | null;
  location_data: LocationData;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  country_code: string;
  country_name: string;
  city?: string;
  place_name?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  points_value: number;
  icon_url: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number | null;
  country_code: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  challenge_id: string;
  unlocked_at: string;
  points_at_unlock: number;
  challenge?: Challenge;
}

export interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  location_tag: string | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user?: Pick<UserProfile, "username" | "display_name" | "avatar_url">;
}

export interface Friendship {
  id: string;
  follower_id: string;
  following_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export interface UserWithAchievements extends UserProfile {
  achievements: UserAchievement[];
}

export interface LeaderboardEntry {
  rank_position: number;
  user: Pick<UserProfile, "id" | "username" | "display_name" | "avatar_url" | "total_points" | "rank">;
}
