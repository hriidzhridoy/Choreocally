import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Post } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useFocusEffect } from "@react-navigation/native";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PostListProps = {
  postItems: Post;
  isActive: boolean;
};

export default function PostListItems({ postItems, isActive }: PostListProps) {
  const { height } = Dimensions.get("window");

  const videoUrl = postItems?.video_url ?? "";
  const userName = postItems?.user?.username ?? "Unknown";
  const description = postItems?.description ?? "";

  const likesCount = useMemo(
    () => Number(postItems?.nrOfLikes?.[0]?.count ?? 0) || 0,
    [postItems]
  );
  const commentsCount = useMemo(
    () => Number(postItems?.nrOfComments?.[0]?.count ?? 0) || 0,
    [postItems]
  );
  const sharesCount = useMemo(
    () => Number(postItems?.nrOfShares?.[0]?.count ?? 0) || 0,
    [postItems]
  );

  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // screen focus tracking
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
        try {
          player.pause();
        } catch {}
      };
    }, [player])
  );

  // ✅ ONLY PLAY WHEN (focused + active)
  useEffect(() => {
    if (!videoUrl) return;

    const shouldPlay = isFocused && isActive;

    try {
      player.muted = muted;
      if (shouldPlay) player.play();
      else player.pause();
    } catch {}
  }, [isFocused, isActive, muted, videoUrl, player]);

  const togglePlay = useCallback(() => {
    if (!isActive) return; // prevent playing non-active item
    try {
      if (player.playing) player.pause();
      else player.play();
    } catch {}
  }, [player, isActive]);

  const toggleMute = useCallback(() => setMuted((p) => !p), []);

  if (!videoUrl) {
    return (
      <View style={[styles.fallback, { height: height - 70 }]}>
        <Text style={styles.fallbackText}>No video found</Text>
      </View>
    );
  }

  return (
    <View style={{ height: height - 70 }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={togglePlay}
        style={StyleSheet.absoluteFill}
      >
        <VideoView
          style={styles.video}
          player={player}
          contentFit="cover"
          nativeControls={false}
        />
      </TouchableOpacity>

      {/* show play icon only for active item */}
      {isActive && !isPlaying && (
        <View style={styles.playOverlay}>
          <Ionicons name="play" size={56} color="#fff" />
        </View>
      )}

      {/* mute button */}
      <View style={styles.topRight}>
        <TouchableOpacity onPress={toggleMute} style={styles.iconPill}>
          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* right controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          onPress={() => setLiked((p) => !p)}
          style={styles.controlBtn}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={33}
            color={liked ? "#ff3b30" : "#fff"}
          />
          <Text style={styles.label}>{likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.controlBtn}>
          <Ionicons name="chatbubble-outline" size={30} color="#fff" />
          <Text style={styles.label}>{commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.controlBtn}>
          <Ionicons name="arrow-redo-outline" size={33} color="#fff" />
          <Text style={styles.label}>{sharesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.controlBtn}>
          <Ionicons name="person-circle" size={38} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.userName}>{userName}</Text>
        {!!description && <Text style={styles.description}>{description}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  video: { flex: 1 },

  controlsContainer: {
    position: "absolute",
    right: 10,
    bottom: 10,
    alignItems: "center",
    gap: 20,
  },
  controlBtn: { alignItems: "center" },

  label: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "700",
  },

  videoInfo: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 90,
  },
  userName: { color: "white", fontSize: 18, fontWeight: "700" },
  description: { color: "#fff", marginTop: 4 },

  playOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -28 }, { translateY: -28 }],
    opacity: 0.9,
  },

  topRight: {
    position: "absolute",
    top: 16,
    right: 12,
  },
  iconPill: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  fallback: {
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: { color: "#fff", fontSize: 16 },
});
