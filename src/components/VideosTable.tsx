import type { TikTokVideo } from '../types/tiktok';
import { formatNumber } from '../utils/format';

type Props = {
  videos: TikTokVideo[];
};

export function VideosTable({ videos }: Props) {
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
                <td>{video.url ? <a href={video.url} target="_blank" rel="noreferrer">{video.title}</a> : video.title}</td>
                <td>{video.accountName}</td>
                <td>{formatNumber(video.views)}</td>
                <td>{formatNumber(video.likes)}</td>
                <td>{formatNumber(video.comments)}</td>
                <td>{formatNumber(video.shares)}</td>
                <td>{video.engagementRate.toFixed(1)}%</td>
              </tr>
            ))}
            {videos.length === 0 && (
              <tr><td className="empty-state" colSpan={7}>Nenhum vídeo encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
