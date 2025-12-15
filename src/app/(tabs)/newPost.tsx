import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_DESC = 150;

export default function NewPostScreen() {
  const [videoUri, setVideoUri] = useState<string>("");
  const [description, setDescription] = useState("");
  const [muted, setMuted] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const player = useVideoPlayer(videoUri || "", (p) => {
    p.loop = true;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // ✅ With expo-router, useFocusEffect should come from "expo-router"
  useFocusEffect(
    useCallback(() => {
      if (videoUri) {
        try {
          player.muted = muted;
          player.play();
        } catch {}
      }

      return () => {
        try {
          player.pause();
        } catch {}
      };
    }, [player, videoUri, muted])
  );

  // keep mute synced
  React.useEffect(() => {
    try {
      player.muted = muted;
    } catch {}
  }, [player, muted]);

  const remaining = useMemo(() => MAX_DESC - description.length, [description]);

  const pickVideo = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission required",
          "Please allow access to your media library."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) {
        Alert.alert("Error", "Could not read the selected video.");
        return;
      }

      // ✅ pause old video before switching
      try {
        player.pause();
      } catch {}

      setVideoUri(uri);
    } catch {
      Alert.alert("Error", "Failed to pick video.");
    }
  }, [player]);

  const togglePlay = useCallback(() => {
    if (!videoUri) return;
    try {
      if (player.playing) player.pause();
      else player.play();
    } catch {}
  }, [player, videoUri]);

  const toggleMute = useCallback(() => setMuted((p) => !p), []);

  const removeVideo = useCallback(() => {
    Alert.alert("Remove video?", "This will discard the selected video.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          try {
            player.pause();
          } catch {}
          setVideoUri("");
        },
      },
    ]);
  }, [player]);

  const onPost = useCallback(async () => {
    if (!videoUri) {
      Alert.alert("Select a video", "Please choose a video to post.");
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        "Add a description",
        "Please write something about the post."
      );
      return;
    }

    try {
      setIsPosting(true);

      // TODO: replace with API upload
      await new Promise((r) => setTimeout(r, 900));

      Alert.alert("Posted ✅", "Your video post has been created.");
      setVideoUri("");
      setDescription("");
    } catch {
      Alert.alert("Error", "Failed to post. Try again.");
    } finally {
      setIsPosting(false);
    }
  }, [videoUri, description]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Post</Text>

          <TouchableOpacity
            onPress={onPost}
            disabled={isPosting || !videoUri}
            style={[
              styles.postBtn,
              (!videoUri || isPosting) && styles.postBtnDisabled,
            ]}
          >
            {isPosting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.postBtnText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Preview area */}
        <View style={styles.body}>
          {!videoUri ? (
            <View style={styles.emptyState}>
              <Ionicons name="videocam-outline" size={60} color="#bbb" />
              <Text style={styles.emptyTitle}>Choose a video to post</Text>

              <TouchableOpacity onPress={pickVideo} style={styles.primaryBtn}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Pick Video</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.previewWrap}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={togglePlay}
                style={StyleSheet.absoluteFill}
              >
                <VideoView
                  style={styles.video}
                  player={player}
                  contentFit="contain"
                />
              </TouchableOpacity>

              {(!isPlaying || !videoUri) && (
                <View style={styles.playOverlay}>
                  <Ionicons name="play" size={60} color="#fff" />
                </View>
              )}

              <View style={styles.topActions}>
                <TouchableOpacity onPress={toggleMute} style={styles.iconPill}>
                  <Ionicons
                    name={muted ? "volume-mute" : "volume-high"}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={pickVideo} style={styles.iconPill}>
                  <Ionicons name="swap-horizontal" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={removeVideo} style={styles.iconPill}>
                  <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={(t) => setDescription(t.slice(0, MAX_DESC))}
            placeholder="Write something..."
            placeholderTextColor="#999"
            multiline
            style={styles.input}
          />
          <Text style={[styles.counter, remaining < 15 && styles.counterWarn]}>
            {description.length}/{MAX_DESC}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },

  container: { flex: 1, backgroundColor: "#000" },

  header: {
    height: 56,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

  postBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#1e88ff",
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnDisabled: { opacity: 0.55 },
  postBtnText: { color: "#fff", fontWeight: "700" },

  body: { flex: 1 },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1e88ff",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },

  previewWrap: { flex: 1 },
  video: { flex: 1 },

  playOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -30 }, { translateY: -30 }],
    opacity: 0.9,
  },

  topActions: {
    position: "absolute",
    top: 14,
    right: 12,
    gap: 10,
  },
  iconPill: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    padding: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#000",
  },
  label: { color: "#fff", fontSize: 13, fontWeight: "600", marginBottom: 8 },
  input: {
    minHeight: 70,
    maxHeight: 120,
    color: "#fff",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    textAlignVertical: "top",
  },
  counter: { color: "#aaa", fontSize: 12, marginTop: 8, textAlign: "right" },
  counterWarn: { color: "#ffcc66" },
});
