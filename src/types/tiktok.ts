export type AccountStatus = 'Conectada' | 'Sem dados' | 'Erro';

export type TikTokAccount = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  followers: number;
  following: number;
  totalLikes: number;
  videoCount: number;
  totalViews: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  status: AccountStatus;
  accessToken: string;
  refreshToken?: string;
  videos: TikTokVideo[];
};

export type TikTokVideo = {
  id: string;
  accountId: string;
  accountName: string;
  title: string;
  url: string;
  postedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
};
