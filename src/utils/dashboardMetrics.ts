import type { TikTokAccount, TikTokVideo } from '../types/tiktok';

export type AccountRanking = {
  account: TikTokAccount;
  videos: number;
  likes: number;
  comments: number;
  shares: number;
};

function sum(values: number[]) {
  return values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
}

function average(total: number, count: number) {
  return count > 0 ? total / count : 0;
}

function maxBy<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce<T | undefined>((best, item) => (
    !best || getValue(item) > getValue(best) ? item : best
  ), undefined);
}

export function getAccountRankings(accounts: TikTokAccount[]): AccountRanking[] {
  return accounts
    .map((account) => {
      const videos = account.videos ?? [];

      return {
        account,
        videos: account.videoCount,
        likes: sum(videos.map((video) => video.likes)),
        comments: sum(videos.map((video) => video.comments)),
        shares: sum(videos.map((video) => video.shares)),
      };
    })
    .sort((a, b) => b.account.totalViews - a.account.totalViews);
}

export function getDashboardMetrics(accounts: TikTokAccount[], videos: TikTokVideo[]) {
  const totalFollowers = sum(accounts.map((account) => account.followers));
  const totalViews = sum(videos.map((video) => video.views));
  const totalVideoLikes = sum(videos.map((video) => video.likes));
  const totalComments = sum(videos.map((video) => video.comments));
  const totalShares = sum(videos.map((video) => video.shares));
  const totalVideos = videos.length;
  const totalInteractions = totalVideoLikes + totalComments + totalShares;
  const accountRankings = getAccountRankings(accounts);
  const videosByViews = [...videos].sort((a, b) => b.views - a.views);
  const videosByEngagement = [...videos].sort((a, b) => b.engagementRate - a.engagementRate);

  return {
    totals: {
      accounts: accounts.length,
      followers: totalFollowers,
      views: totalViews,
      videoLikes: totalVideoLikes,
      comments: totalComments,
      shares: totalShares,
      videos: totalVideos,
    },
    averages: {
      engagement: totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0,
      viewsPerVideo: average(totalViews, totalVideos),
      likesPerVideo: average(totalVideoLikes, totalVideos),
      commentsPerVideo: average(totalComments, totalVideos),
      sharesPerVideo: average(totalShares, totalVideos),
    },
    highlights: {
      bestAccountByViews: maxBy(accounts, (account) => account.totalViews),
      bestAccountByEngagement: maxBy(accounts, (account) => account.engagementRate),
      bestVideoByViews: videosByViews[0],
      bestVideoByEngagement: videosByEngagement[0],
      accountWithMostVideos: maxBy(accounts, (account) => account.videoCount),
      accountWithMostFollowers: maxBy(accounts, (account) => account.followers),
    },
    accountRankings,
    videosByViews,
    videosByEngagement,
  };
}

export function truncateLabel(value: string, maxLength = 24) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}
