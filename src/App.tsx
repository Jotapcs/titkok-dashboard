import { useEffect, useMemo, useState } from 'react';
import { MetricCard } from './components/MetricCard';
import { AccountsTable } from './components/AccountsTable';
import { AccountRankingTable } from './components/AccountRankingTable';
import { DashboardCharts } from './components/DashboardCharts';
import { TopVideosByEngagement } from './components/TopVideosByEngagement';
import { VideoRankingTable } from './components/VideoRankingTable';
import {
  disconnectTikTok,
  getTikTokDashboardData,
  handleTikTokCallback,
  isTikTokConnected,
  removeConnectedAccount,
  startTikTokLogin,
} from './services/tiktokService';
import type { TikTokAccount, TikTokVideo } from './types/tiktok';
import { getDashboardMetrics } from './utils/dashboardMetrics';
import { formatNumber } from './utils/format';
import './styles.css';

export default function App() {
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [connected, setConnected] = useState(isTikTokConnected());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Conecte sua conta TikTok para buscar dados reais.');

  async function loadTikTokData(refresh = true) {
    setLoading(true);
    setMessage('Buscando dados no TikTok...');

    try {
      const data = await getTikTokDashboardData(refresh);
      setAccounts(data.accounts);
      setVideos(data.videos);
      setConnected(data.accounts.length > 0);
      setMessage(
        data.accounts.some((account) => account.status === 'Erro')
          ? 'Algumas contas não puderam ser atualizadas. Exibindo os últimos dados salvos.'
          : 'Dados carregados com sucesso.',
      );
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
          await loadTikTokData(false);
        } catch (error) {
          setMessage(error instanceof Error ? error.message : 'Erro no callback do TikTok.');
        } finally {
          setLoading(false);
        }
        return;
      }

      if (isTikTokConnected()) {
        await loadTikTokData(false);
      }
    }

    boot();
  }, []);

  const metrics = useMemo(() => getDashboardMetrics(accounts, videos), [accounts, videos]);

  function handleDisconnect() {
    disconnectTikTok();
    setConnected(false);
    setAccounts([]);
    setVideos([]);
    setMessage('Conta desconectada.');
  }

  function handleDisconnectAccount(accountId: string) {
    removeConnectedAccount(accountId);
    const remainingAccounts = accounts.filter((account) => account.id !== accountId);
    setAccounts(remainingAccounts);
    setVideos(remainingAccounts.flatMap((account) => account.videos ?? []));
    setConnected(remainingAccounts.length > 0);
    setMessage('Conta desconectada. As demais contas foram mantidas.');
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
          <button onClick={startTikTokLogin} disabled={loading}>
            {connected ? '+ Conectar nova conta' : 'Conectar TikTok'}
          </button>
          {connected && <button className="secondary" onClick={() => loadTikTokData(true)} disabled={loading}>Atualizar dados</button>}
          {connected && <button className="secondary" onClick={handleDisconnect}>Desconectar tudo</button>}
        </div>
      </header>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Visão geral</p>
            <h2>Métricas consolidadas</h2>
          </div>
          <p>Dados somados de todas as contas conectadas.</p>
        </div>
        <div className="grid metric-grid">
          <MetricCard label="Contas conectadas" value={String(metrics.totals.accounts)} helper="perfis monitorados" />
          <MetricCard label="Seguidores" value={formatNumber(metrics.totals.followers)} helper="audiência total" />
          <MetricCard label="Views" value={formatNumber(metrics.totals.views)} helper="alcance analisado" />
          <MetricCard label="Likes nos vídeos" value={formatNumber(metrics.totals.videoLikes)} helper="curtidas recebidas" />
          <MetricCard label="Comentários" value={formatNumber(metrics.totals.comments)} helper="conversas geradas" />
          <MetricCard label="Compartilhamentos" value={formatNumber(metrics.totals.shares)} helper="shares recebidos" />
          <MetricCard label="Vídeos analisados" value={formatNumber(metrics.totals.videos)} helper="conteúdos carregados" />
          <MetricCard label="Engajamento geral" value={`${metrics.averages.engagement.toFixed(2)}%`} helper="interações ÷ views" />
          <MetricCard label="Média de views" value={formatNumber(metrics.averages.viewsPerVideo)} helper="por vídeo" />
          <MetricCard label="Média de likes" value={formatNumber(metrics.averages.likesPerVideo)} helper="por vídeo" />
          <MetricCard label="Média de comentários" value={formatNumber(metrics.averages.commentsPerVideo)} helper="por vídeo" />
          <MetricCard label="Média de shares" value={formatNumber(metrics.averages.sharesPerVideo)} helper="por vídeo" />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Destaques</p>
            <h2>Melhores resultados</h2>
          </div>
          <p>Líderes entre as contas e vídeos carregados.</p>
        </div>
        <div className="grid highlight-grid">
        <div className="panel highlight">
          <span className="muted">Melhor conta por views</span>
          <strong>{metrics.highlights.bestAccountByViews?.displayName ?? '—'}</strong>
          <p>{metrics.highlights.bestAccountByViews ? `${formatNumber(metrics.highlights.bestAccountByViews.totalViews)} views` : 'Sem dados'}</p>
        </div>
        <div className="panel highlight">
          <span className="muted">Melhor conta por engajamento</span>
          <strong>{metrics.highlights.bestAccountByEngagement?.displayName ?? '—'}</strong>
          <p>{metrics.highlights.bestAccountByEngagement ? `${metrics.highlights.bestAccountByEngagement.engagementRate.toFixed(2)}% de engajamento` : 'Sem dados'}</p>
        </div>
        <div className="panel highlight">
          <span className="muted">Melhor vídeo por views</span>
          <strong title={metrics.highlights.bestVideoByViews?.title}>{metrics.highlights.bestVideoByViews?.title ?? '—'}</strong>
          <p>{metrics.highlights.bestVideoByViews ? `${formatNumber(metrics.highlights.bestVideoByViews.views)} views` : 'Sem dados'}</p>
        </div>
        <div className="panel highlight">
          <span className="muted">Melhor vídeo por engajamento</span>
          <strong title={metrics.highlights.bestVideoByEngagement?.title}>{metrics.highlights.bestVideoByEngagement?.title ?? '—'}</strong>
          <p>{metrics.highlights.bestVideoByEngagement ? `${metrics.highlights.bestVideoByEngagement.engagementRate.toFixed(2)}% de engajamento` : 'Sem dados'}</p>
        </div>
        <div className="panel highlight">
          <span className="muted">Conta com mais vídeos</span>
          <strong>{metrics.highlights.accountWithMostVideos?.displayName ?? '—'}</strong>
          <p>{metrics.highlights.accountWithMostVideos ? `${formatNumber(metrics.highlights.accountWithMostVideos.videoCount)} vídeos publicados` : 'Sem dados'}</p>
        </div>
        <div className="panel highlight">
          <span className="muted">Conta com mais seguidores</span>
          <strong>{metrics.highlights.accountWithMostFollowers?.displayName ?? '—'}</strong>
          <p>{metrics.highlights.accountWithMostFollowers ? `${formatNumber(metrics.highlights.accountWithMostFollowers.followers)} seguidores` : 'Sem dados'}</p>
        </div>
        </div>
      </section>

      <DashboardCharts
        accounts={accounts}
        videosByViews={metrics.videosByViews}
        videosByEngagement={metrics.videosByEngagement}
      />

      <section className="dashboard-section rankings-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Detalhamento</p>
            <h2>Rankings completos</h2>
          </div>
          <p>Compare alcance, audiência e interações.</p>
        </div>
        <AccountRankingTable rankings={metrics.accountRankings} />
        <VideoRankingTable videos={metrics.videosByViews} />
        <TopVideosByEngagement videos={metrics.videosByEngagement} />
      </section>

      <div className="section-heading account-management-heading">
        <div>
          <p className="eyebrow">Configuração</p>
          <h2>Contas conectadas</h2>
        </div>
        <p>Gerencie as contas salvas neste navegador.</p>
      </div>
      <AccountsTable accounts={accounts} onDisconnect={handleDisconnectAccount} />
    </main>
  );
}
