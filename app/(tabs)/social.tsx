import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PostCard } from "../../src/components/social/PostCard";
import { useSocial } from "../../src/hooks/useSocial";
import { useAuth } from "../../src/hooks/useAuth";
import { COLORS } from "../../src/constants/theme";

export default function SocialScreen() {
  const { profile } = useAuth();
  const { posts, isLoading, refresh, createPost } = useSocial(profile?.id ?? null);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  async function handlePost() {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    await createPost(newPostContent.trim());
    setNewPostContent("");
    setIsPosting(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-white font-bold text-2xl">🐰 Rabbit Network</Text>
        <Text className="text-brand-muted text-sm mt-1">Share your travel moments</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <FlatList
          contentContainerClassName="px-5 pb-8"
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          refreshing={isLoading}
          onRefresh={refresh}
          ListEmptyComponent={
            <Text className="text-brand-muted text-center mt-12">
              No posts yet. Be the first to share!
            </Text>
          }
          ListHeaderComponent={
            <View className="bg-brand-card border border-brand-border rounded-2xl p-3 mb-4">
              <TextInput
                value={newPostContent}
                onChangeText={setNewPostContent}
                placeholder="Where have you been? ✈️"
                placeholderTextColor={COLORS.muted}
                multiline
                className="text-white text-sm min-h-[60px]"
                style={{ color: COLORS.white }}
              />
              <Pressable
                onPress={handlePost}
                disabled={isPosting || !newPostContent.trim()}
                className={`self-end mt-2 px-5 py-2 rounded-xl bg-brand-primary ${
                  isPosting || !newPostContent.trim() ? "opacity-50" : ""
                }`}
              >
                <Text className="text-white font-semibold text-sm">
                  {isPosting ? "Posting..." : "Share"}
                </Text>
              </Pressable>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
