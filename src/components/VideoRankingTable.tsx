import type { TikTokVideo } from '../types/tiktok';
import { formatNumber } from '../utils/format';

type Props = {
  videos: TikTokVideo[];
};

export function VideoRankingTable({ videos }: Props) {
  return (
    <section className="panel ranking-panel">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">Ranking</p>
          <h2>Vídeos por views</h2>
        </div>
        <p>Todos os vídeos carregados, do maior para o menor alcance.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Vídeo</th>
              <th>Conta</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Comentários</th>
              <th>Shares</th>
              <th>Engajamento</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video, index) => (
              <tr key={`${video.accountId}-${video.id}`}>
                <td><span className="rank-number">{index + 1}</span></td>
                <td><span className="video-title" title={video.title}>{video.title}</span></td>
                <td>{video.accountName}</td>
                <td>{formatNumber(video.views)}</td>
                <td>{formatNumber(video.likes)}</td>
                <td>{formatNumber(video.comments)}</td>
                <td>{formatNumber(video.shares)}</td>
                <td>{video.engagementRate.toFixed(2)}%</td>
                <td>{video.url ? <a className="table-link" href={video.url} target="_blank" rel="noreferrer">Abrir ↗</a> : '—'}</td>
              </tr>
            ))}
            {videos.length === 0 && <tr><td className="empty-state" colSpan={9}>Nenhum vídeo para ranquear.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
