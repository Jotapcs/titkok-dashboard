import type { TikTokAccount } from '../types/tiktok';
import { formatNumber } from '../utils/format';

type Props = {
  accounts: TikTokAccount[];
};

export function AccountsTable({ accounts }: Props) {
  return (
    <section className="panel">
      <h2>Contas</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Conta</th>
              <th>Nome</th>
              <th>Seguidores</th>
              <th>Views</th>
              <th>Engaj.</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.username}</td>
                <td>{account.displayName}</td>
                <td>{formatNumber(account.followers)}</td>
                <td>{formatNumber(account.totalViews)}</td>
                <td>{account.engagementRate.toFixed(1)}%</td>
                <td><span className="badge">{account.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
