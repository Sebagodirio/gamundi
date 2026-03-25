import { Image, Text, View } from "react-native";
import { Card } from "../ui/Card";
import type { SocialPost } from "../../types";

interface PostCardProps {
  post: SocialPost;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function PostCard({ post }: PostCardProps) {
  const user = post.user;
  const initials = user?.display_name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <Card className="mb-3">
      <View className="flex-row items-center gap-3 mb-3">
        {user?.avatar_url ? (
          <Image
            source={{ uri: user.avatar_url }}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-brand-primary items-center justify-center">
            <Text className="text-white font-bold text-sm">{initials}</Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-white font-semibold text-sm">
            {user?.display_name ?? "Unknown"}
          </Text>
          <Text className="text-brand-muted text-xs">
            @{user?.username ?? "unknown"}
            {post.location_tag ? ` · 📍 ${post.location_tag}` : ""}
          </Text>
        </View>
        <Text className="text-brand-muted text-xs">
          {formatRelativeTime(post.created_at)}
        </Text>
      </View>

      <Text className="text-white text-sm leading-5">{post.content}</Text>

      {post.image_url && (
        <Image
          source={{ uri: post.image_url }}
          className="w-full h-48 rounded-xl mt-3"
          resizeMode="cover"
        />
      )}

      <View className="flex-row items-center gap-1 mt-3">
        <Text className="text-brand-muted text-xs">❤️ {post.likes_count}</Text>
      </View>
    </Card>
  );
}
