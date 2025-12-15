import React, { useRef, useState } from "react";
import PostListItems from "@/components/PostListItems";
import { Dimensions, FlatList, View } from "react-native";
import posts from "@assets/data/posts.json";

export default function HomeScreen() {
  const { height } = Dimensions.get("window");
  const ITEM_HEIGHT = height - 70;

  const [activePostId, setActivePostId] = useState<string>(
    posts?.[0]?.id ?? "1"
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80, // only when mostly visible
  }).current;

  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{ item: any; isViewable: boolean }>;
    }) => {
      const firstVisible = viewableItems.find((v) => v.isViewable)?.item;
      if (firstVisible?.id) setActivePostId(firstVisible.id);
    }
  ).current;

  return (
    <View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostListItems postItems={item} isActive={item.id === activePostId} />
        )}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate={"fast"}
        disableIntervalMomentum
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled={false} // snapToInterval is enough
        removeClippedSubviews
        windowSize={5}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
      />
    </View>
  );
}
