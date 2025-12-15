import PostListItems from "@/components/PostListItems";
import { FlatList, StyleSheet, Text, View } from "react-native";
import posts from "@assets/data/posts.json";

export default function HomeScreen() {
  return (
    <View>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostListItems postItems={item} />}
      />
    </View>
  );
}
