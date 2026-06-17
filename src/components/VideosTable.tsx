import type { TikTokAccount, TikTokVideo } from '../types/tiktok';
import { formatNumber } from '../utils/format';

type Props = {
  videos: TikTokVideo[];
  accounts: TikTokAccount[];
};

export function VideosTable({ videos, accounts }: Props) {
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.username ?? '-';

  return (
    <section className="panel">
      <h2>Vídeos em destaque</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Vídeo</th>
              <th>Conta</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Comentários</th>
              <th>Shares</th>
              <th>Engaj.</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id}>
                <td>{video.title}</td>
                <td>{accountName(video.accountId)}</td>
                <td>{formatNumber(video.views)}</td>
                <td>{formatNumber(video.likes)}</td>
                <td>{formatNumber(video.comments)}</td>
                <td>{formatNumber(video.shares)}</td>
                <td>{video.engagementRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
