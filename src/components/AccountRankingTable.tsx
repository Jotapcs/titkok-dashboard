import type { AccountRanking } from '../utils/dashboardMetrics';
import { formatNumber } from '../utils/format';

type Props = {
  rankings: AccountRanking[];
};

export function AccountRankingTable({ rankings }: Props) {
  return (
    <section className="panel ranking-panel">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">Ranking</p>
          <h2>Contas por views</h2>
        </div>
        <p>Ordenado pelo alcance total dos vídeos analisados.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Conta</th>
              <th>Seguidores</th>
              <th>Vídeos</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Comentários</th>
              <th>Shares</th>
              <th>Engajamento</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map(({ account, videos, likes, comments, shares }, index) => (
              <tr key={account.id}>
                <td><span className="rank-number">{index + 1}</span></td>
                <td>
                  <span className="account-cell">
                    {account.avatarUrl && <img src={account.avatarUrl} alt="" />}
                    {account.displayName}
                  </span>
                </td>
                <td>{formatNumber(account.followers)}</td>
                <td>{formatNumber(videos)}</td>
                <td>{formatNumber(account.totalViews)}</td>
                <td>{formatNumber(likes)}</td>
                <td>{formatNumber(comments)}</td>
                <td>{formatNumber(shares)}</td>
                <td>{account.engagementRate.toFixed(2)}%</td>
              </tr>
            ))}
            {rankings.length === 0 && <tr><td className="empty-state" colSpan={9}>Nenhuma conta para ranquear.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
