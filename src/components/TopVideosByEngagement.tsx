import type { TikTokVideo } from '../types/tiktok';
import { formatNumber } from '../utils/format';

type Props = {
  videos: TikTokVideo[];
};

export function TopVideosByEngagement({ videos }: Props) {
  return (
    <aside className="panel engagement-ranking">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">Top 5</p>
          <h2>Maior engajamento</h2>
        </div>
      </div>
      <ol>
        {videos.slice(0, 5).map((video, index) => (
          <li key={`${video.accountId}-${video.id}`}>
            <span className="rank-number">{index + 1}</span>
            <div>
              {video.url ? (
                <a href={video.url} target="_blank" rel="noreferrer" title={video.title}>{video.title}</a>
              ) : <strong title={video.title}>{video.title}</strong>}
              <small>{video.accountName} · {formatNumber(video.views)} views</small>
            </div>
            <b>{video.engagementRate.toFixed(2)}%</b>
          </li>
        ))}
      </ol>
      {videos.length === 0 && <p className="empty-state">Nenhum vídeo para ranquear.</p>}
    </aside>
  );
}
