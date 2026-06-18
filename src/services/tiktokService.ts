import type { TikTokAccount, TikTokVideo } from '../types/tiktok';

const CLIENT_KEY = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = import.meta.env.VITE_TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_TIKTOK_REDIRECT_URI;

const ACCOUNTS_STORAGE_KEY = 'tiktok_connected_accounts';
const LEGACY_TOKEN_STORAGE_KEY = 'tiktok_access_token';
const LEGACY_REFRESH_TOKEN_STORAGE_KEY = 'tiktok_refresh_token';
const OAUTH_STATE_STORAGE_KEY = 'tiktok_oauth_state';
const CODE_VERIFIER_STORAGE_KEY = 'tiktok_code_verifier';

export function getConnectedAccounts(): TikTokAccount[] {
  try {
    const savedAccounts = JSON.parse(localStorage.getItem(ACCOUNTS_STORAGE_KEY) ?? '[]');
    return Array.isArray(savedAccounts) ? savedAccounts : [];
  } catch {
    return [];
  }
}

export function saveConnectedAccount(account: TikTokAccount) {
  const accounts = getConnectedAccounts();
  const existingIndex = accounts.findIndex((item) => item.id === account.id);

  if (existingIndex >= 0) {
    accounts[existingIndex] = account;
  } else {
    accounts.push(account);
  }

  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

export function removeConnectedAccount(accountId: string) {
  const accounts = getConnectedAccounts().filter((account) => account.id !== accountId);
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

export function clearConnectedAccounts() {
  localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
  localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_STORAGE_KEY);
}

function base64UrlEncode(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function randomBase64Url(length = 64) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes.buffer);
}

async function createCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

export function isTikTokConnected() {
  return getConnectedAccounts().length > 0 || Boolean(localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY));
}

export function disconnectTikTok() {
  clearConnectedAccounts();
  localStorage.removeItem(OAUTH_STATE_STORAGE_KEY);
  localStorage.removeItem(CODE_VERIFIER_STORAGE_KEY);
}

export async function startTikTokLogin() {
  if (!CLIENT_KEY || !REDIRECT_URI) {
    throw new Error('Configure VITE_TIKTOK_CLIENT_KEY e VITE_TIKTOK_REDIRECT_URI no .env.');
  }

  const state = crypto.randomUUID();

  const codeVerifier = randomBase64Url(64);
  const codeChallenge = await createCodeChallenge(codeVerifier);

  localStorage.setItem(OAUTH_STATE_STORAGE_KEY, state);
  localStorage.setItem(CODE_VERIFIER_STORAGE_KEY, codeVerifier);

  const params = new URLSearchParams();

  params.set('client_key', CLIENT_KEY);
  params.set('response_type', 'code');
  params.set('scope', 'user.info.basic,user.info.profile,user.info.stats,video.list');
  params.set('redirect_uri', REDIRECT_URI);
  params.set('state', state);
  params.set('code_challenge', codeChallenge);
  params.set('code_challenge_method', 'S256');
  params.set('prompt', 'login');

  window.location.href = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

export async function handleTikTokCallback(code: string, state: string | null) {
  const savedState = localStorage.getItem(OAUTH_STATE_STORAGE_KEY);
  const codeVerifier = localStorage.getItem(CODE_VERIFIER_STORAGE_KEY);

  if (!savedState || state !== savedState) {
    throw new Error('State inválido no callback do TikTok.');
  }

  if (!codeVerifier) {
    throw new Error('Code verifier não encontrado. Tente conectar novamente.');
  }

  const body = new URLSearchParams({
    client_key: CLIENT_KEY,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.message || 'Erro ao trocar code por token.');
  }

  localStorage.removeItem(OAUTH_STATE_STORAGE_KEY);
  localStorage.removeItem(CODE_VERIFIER_STORAGE_KEY);

  const account = await fetchAccountWithToken(data.access_token, data.refresh_token);
  saveConnectedAccount(account);

  return account;
}

async function tiktokFetch<T>(accessToken: string, url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  const data = await response.json();

  if (!response.ok || data.error?.code !== 'ok') {
    throw new Error(data.error?.message || data.message || 'Erro ao buscar dados no TikTok.');
  }

  return data;
}

async function getAccountProfile(accessToken: string) {
  const fields = [
    'open_id',
    'union_id',
    'avatar_url',
    'display_name',
    'follower_count',
    'following_count',
    'likes_count',
    'video_count',
  ].join(',');

  const data = await tiktokFetch<any>(
    accessToken,
    `https://open.tiktokapis.com/v2/user/info/?fields=${fields}`
  );

  const user = data.data.user;

  return {
    id: user.open_id,
    username: user.display_name,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    followers: user.follower_count ?? 0,
    following: user.following_count ?? 0,
    totalLikes: user.likes_count ?? 0,
    videoCount: user.video_count ?? 0,
    totalViews: 0,
    totalComments: 0,
    totalShares: 0,
    engagementRate: 0,
  };
}

export async function fetchVideosWithToken(
  accessToken: string,
  accountId: string,
  accountName: string,
): Promise<TikTokVideo[]> {
  const fields = [
    'id',
    'title',
    'video_description',
    'share_url',
    'embed_link',
    'create_time',
    'view_count',
    'like_count',
    'comment_count',
    'share_count',
  ].join(',');

  const data = await tiktokFetch<any>(
    accessToken,
    `https://open.tiktokapis.com/v2/video/list/?fields=${fields}`,
    {
      method: 'POST',
      body: JSON.stringify({
        max_count: 20,
      }),
    }
  );

  return (data.data.videos ?? []).map((video: any) => {
    const views = video.view_count ?? 0;
    const likes = video.like_count ?? 0;
    const comments = video.comment_count ?? 0;
    const shares = video.share_count ?? 0;

    return {
      id: video.id,
      accountId,
      accountName,
      title: video.title || video.video_description || 'Sem título',
      url: video.share_url || video.embed_link || '',
      postedAt: video.create_time
        ? new Date(video.create_time * 1000).toISOString()
        : '',
      views,
      likes,
      comments,
      shares,
      engagementRate:
        views > 0 ? ((likes + comments + shares) / views) * 100 : 0,
    };
  });
}

export async function fetchAccountWithToken(
  accessToken: string,
  refreshToken?: string,
): Promise<TikTokAccount> {
  const account = await getAccountProfile(accessToken);
  const videos = await fetchVideosWithToken(accessToken, account.id, account.displayName);

  const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
  const totalComments = videos.reduce((sum, video) => sum + video.comments, 0);
  const totalShares = videos.reduce((sum, video) => sum + video.shares, 0);
  const totalVideoLikes = videos.reduce((sum, video) => sum + video.likes, 0);

  return {
    ...account,
    totalViews,
    totalComments,
    totalShares,
    engagementRate:
      totalViews > 0
        ? ((totalVideoLikes + totalComments + totalShares) / totalViews) * 100
        : 0,
    status: 'Conectada',
    accessToken,
    refreshToken,
    videos,
  };
}

async function migrateLegacyAccount() {
  if (getConnectedAccounts().length > 0) return;

  const accessToken = localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);
  if (!accessToken) return;

  const refreshToken = localStorage.getItem(LEGACY_REFRESH_TOKEN_STORAGE_KEY) ?? undefined;
  const account = await fetchAccountWithToken(accessToken, refreshToken);
  saveConnectedAccount(account);
  localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_STORAGE_KEY);
}

export async function getTikTokDashboardData(refresh = false) {
  await migrateLegacyAccount();
  let accounts = getConnectedAccounts();

  if (refresh) {
    accounts = await Promise.all(
      accounts.map(async (account) => {
        try {
          const updatedAccount = await fetchAccountWithToken(
            account.accessToken,
            account.refreshToken,
          );
          saveConnectedAccount(updatedAccount);
          return updatedAccount;
        } catch {
          return { ...account, status: 'Erro' as const };
        }
      }),
    );
  }

  return {
    accounts,
    videos: accounts.flatMap((account) => account.videos ?? []),
  };
}
