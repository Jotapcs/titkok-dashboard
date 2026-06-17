import { useEffect, useMemo, useState } from 'react';
import { MetricCard } from './components/MetricCard';
import { AccountsTable } from './components/AccountsTable';
import { VideosTable } from './components/VideosTable';
import {
  disconnectTikTok,
  getTikTokDashboardData,
  handleTikTokCallback,
  isTikTokConnected,
  startTikTokLogin,
} from './services/tiktokService';
import type { TikTokAccount, TikTokVideo } from './types/tiktok';
import { formatNumber } from './utils/format';
import './styles.css';

export default function App() {
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [connected, setConnected] = useState(isTikTokConnected());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Conecte sua conta TikTok para buscar dados reais.');

  async function loadTikTokData() {
    setLoading(true);
    setMessage('Buscando dados no TikTok...');

    try {
      const data = await getTikTokDashboardData();
      setAccounts(data.accounts);
      setVideos(data.videos);
      setConnected(true);
      setMessage('Dados carregados com sucesso.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function boot() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (code) {
        try {
          setLoading(true);
          setMessage('Finalizando login com TikTok...');
          await handleTikTokCallback(code, state);
          window.history.replaceState({}, document.title, '/');
          setConnected(true);
          await loadTikTokData();
        } catch (error) {
          setMessage(error instanceof Error ? error.message : 'Erro no callback do TikTok.');
        } finally {
          setLoading(false);
        }
        return;
      }

      if (isTikTokConnected()) {
        await loadTikTokData();
      }
    }

    boot();
  }, []);

  const summary = useMemo(() => {
    const totalFollowers = accounts.reduce((sum, item) => sum + item.followers, 0);
    const totalViews = accounts.reduce((sum, item) => sum + item.totalViews, 0);
    const avgEngagement = accounts.length
      ? accounts.reduce((sum, item) => sum + item.engagementRate, 0) / accounts.length
      : 0;
    const bestAccount = [...accounts].sort((a, b) => b.totalViews - a.totalViews)[0];
    const bestVideo = [...videos].sort((a, b) => b.views - a.views)[0];

    return { totalFollowers, totalViews, avgEngagement, bestAccount, bestVideo };
  }, [accounts, videos]);

  function handleDisconnect() {
    disconnectTikTok();
    setConnected(false);
    setAccounts([]);
    setVideos([]);
    setMessage('Conta desconectada.');
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">TikTok Ops</p>
          <h1>Controle das suas contas TikTok</h1>
          <p className="subtitle">Dados reais via TikTok Display API.</p>
          <p className="status-message">{message}</p>
        </div>

        <div className="actions">
          {!connected && <button onClick={startTikTokLogin}>Conectar TikTok</button>}
          {connected && <button onClick={loadTikTokData} disabled={loading}>Atualizar dados</button>}
          {connected && <button className="secondary" onClick={handleDisconnect}>Desconectar</button>}
        </div>
      </header>

      <section className="grid cards">
        <MetricCard label="Contas" value={String(accounts.length)} />
        <MetricCard label="Seguidores" value={formatNumber(summary.totalFollowers)} />
        <MetricCard label="Views" value={formatNumber(summary.totalViews)} />
        <MetricCard label="Engajamento médio" value={`${summary.avgEngagement.toFixed(1)}%`} />
      </section>

      <section className="grid highlight-grid">
        <div className="panel highlight">
          <span className="muted">Melhor conta</span>
          <strong>{summary.bestAccount?.username ?? '-'}</strong>
          <p>{summary.bestAccount ? `${formatNumber(summary.bestAccount.totalViews)} views` : 'Sem dados'}</p>
        </div>
        <div className="panel highlight">
          <span className="muted">Melhor vídeo</span>
          <strong>{summary.bestVideo?.title ?? '-'}</strong>
          <p>{summary.bestVideo ? `${formatNumber(summary.bestVideo.views)} views` : 'Sem dados'}</p>
        </div>
      </section>

      <AccountsTable accounts={accounts} />
      <VideosTable videos={videos} accounts={accounts} />
    </main>
  );
}
