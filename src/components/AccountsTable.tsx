import type { TikTokAccount } from '../types/tiktok';
import { formatNumber } from '../utils/format';

type Props = {
  accounts: TikTokAccount[];
  onDisconnect: (accountId: string) => void;
};

export function AccountsTable({ accounts, onDisconnect }: Props) {
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
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>
                  <span className="account-cell">
                    {account.avatarUrl && <img src={account.avatarUrl} alt="" />}
                    {account.username}
                  </span>
                </td>
                <td>{account.displayName}</td>
                <td>{formatNumber(account.followers)}</td>
                <td>{formatNumber(account.totalViews)}</td>
                <td>{account.engagementRate.toFixed(1)}%</td>
                <td><span className="badge">{account.status}</span></td>
                <td>
                  <button
                    className="danger text-button"
                    onClick={() => onDisconnect(account.id)}
                    aria-label={`Desconectar ${account.displayName}`}
                  >
                    Desconectar
                  </button>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr><td className="empty-state" colSpan={7}>Nenhuma conta conectada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
