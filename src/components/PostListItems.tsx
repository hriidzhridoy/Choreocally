import { Post } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  Button,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const videoSource =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

type PostListProps = {
  postItems: Post;
};
export default function PostListItems({ postItems }: PostListProps) {
  const { height } = Dimensions.get("window");

  const { nrOfLikes, nrOfComments, nrOfShares, user, video_url, description } =
    postItems;
  const player = useVideoPlayer(video_url, (player) => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });
  return (
    <View style={{ height: height - 80 }}>
      {/* VIDEO */}
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        // nativeControls={false}
      />

      {/* CONTROLS OVERLAY */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={() => console.log("Like Pressed")}>
          <Ionicons name="heart" size={33} color="#fff" />
          <Text style={styles.label}>{nrOfLikes[0].count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => console.log("Comment Pressed")}>
          <Ionicons name="chatbubble" size={30} color="#fff" />
          <Text style={styles.label}>{nrOfComments[0].count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => console.log("Share Pressed")}>
          <Ionicons name="arrow-redo" size={33} color="#fff" />
          <Text style={styles.label}>{nrOfShares[0].count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => console.log("Profile Pressed")}>
          <Ionicons name="person-circle" size={38} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.userName}>{user.username}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    flex: 1,
  },

  controlsContainer: {
    position: "absolute",
    right: 10,
    bottom: 10,
    alignItems: "center",
    gap: 20,
  },

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
  },
  userName: {
    color: "white",
    fontSize: 18,
    fontWeight: 700,
  },
  description: {
    color: "#fff",
  },
});
