export type User = {
  id: string;
  email: string;
  username: string;
};

export type Post = {
  id: string;
  video_url: string;
  description: string;
  user: User;
  nrOfLikes: { count: number }[];
  nrOfComments: { count: number }[];
  nrOfShares: { count: number }[];
};
