import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TikTokAccount, TikTokVideo } from '../types/tiktok';
import { formatNumber } from '../utils/format';
import { truncateLabel } from '../utils/dashboardMetrics';
import { ChartCard } from './ChartCard';

type Props = {
  accounts: TikTokAccount[];
  videosByViews: TikTokVideo[];
  videosByEngagement: TikTokVideo[];
};

const COLORS = ['#25f4ee', '#fe2c55', '#a78bfa', '#f59e0b', '#34d399'];
const axisStyle = { fill: '#a1a1aa', fontSize: 12 };

function AccountBarChart({ data, dataKey, percent = false }: {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  percent?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => percent ? `${value}%` : formatNumber(Number(value))}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          formatter={(value) => percent ? `${Number(value).toFixed(2)}%` : formatNumber(Number(value))}
          contentStyle={{ background: '#09090b', border: '1px solid #3f3f46', borderRadius: 10 }}
        />
        <Bar dataKey={dataKey} radius={[7, 7, 0, 0]}>
          {data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DashboardCharts({ accounts, videosByViews, videosByEngagement }: Props) {
  const accountData = accounts.map((account) => ({
    name: truncateLabel(account.displayName, 14),
    views: account.totalViews,
    engagement: Number(account.engagementRate.toFixed(2)),
    followers: account.followers,
    videos: account.videoCount,
  }));
  const topByViews = videosByViews.slice(0, 10).map((video) => ({
    name: truncateLabel(video.title),
    views: video.views,
  }));
  const topByEngagement = videosByEngagement.slice(0, 10).map((video) => ({
    name: truncateLabel(video.title),
    engagement: Number(video.engagementRate.toFixed(2)),
  }));
  const engagementDistribution = videosByViews.map((video, index) => ({
    name: `#${index + 1}`,
    engagement: Number(video.engagementRate.toFixed(2)),
    title: truncateLabel(video.title),
  }));
  const scatterData = videosByViews.map((video) => ({
    name: truncateLabel(video.title),
    views: video.views,
    engagement: Number(video.engagementRate.toFixed(2)),
  }));

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Visualizações</p>
          <h2>Desempenho em gráficos</h2>
        </div>
        <p>Comparativos das contas e dos vídeos analisados.</p>
      </div>

      <div className="chart-grid">
        <ChartCard title="Views por conta" subtitle="Views totais dos vídeos carregados" hasData={accountData.length > 0}>
          <AccountBarChart data={accountData} dataKey="views" />
        </ChartCard>
        <ChartCard title="Engajamento por conta" subtitle="Taxa consolidada por conta" hasData={accountData.length > 0}>
          <AccountBarChart data={accountData} dataKey="engagement" percent />
        </ChartCard>
        <ChartCard title="Seguidores por conta" subtitle="Audiência atual por perfil" hasData={accountData.length > 0}>
          <AccountBarChart data={accountData} dataKey="followers" />
        </ChartCard>
        <ChartCard title="Vídeos por conta" subtitle="Quantidade total de vídeos publicados" hasData={accountData.length > 0}>
          <AccountBarChart data={accountData} dataKey="videos" />
        </ChartCard>

        <ChartCard title="Top 10 vídeos por views" subtitle="Conteúdos com maior alcance" hasData={topByViews.length > 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topByViews} layout="vertical" margin={{ left: 8, right: 20 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(value) => formatNumber(Number(value))} />
              <YAxis type="category" dataKey="name" width={130} tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => formatNumber(Number(value))} contentStyle={{ background: '#09090b', border: '1px solid #3f3f46', borderRadius: 10 }} />
              <Bar dataKey="views" fill="#25f4ee" radius={[0, 7, 7, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 10 por engajamento" subtitle="Vídeos com maior taxa de interação" hasData={topByEngagement.length > 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topByEngagement} layout="vertical" margin={{ left: 8, right: 20 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
              <YAxis type="category" dataKey="name" width={130} tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} contentStyle={{ background: '#09090b', border: '1px solid #3f3f46', borderRadius: 10 }} />
              <Bar dataKey="engagement" fill="#fe2c55" radius={[0, 7, 7, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribuição de engajamento" subtitle="Taxa de cada vídeo analisado" hasData={engagementDistribution.length > 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementDistribution} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} labelFormatter={(_, payload) => payload?.[0]?.payload?.title ?? ''} contentStyle={{ background: '#09090b', border: '1px solid #3f3f46', borderRadius: 10 }} />
              <Bar dataKey="engagement" fill="#a78bfa" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Views x engajamento" subtitle="Cada ponto representa um vídeo" hasData={scatterData.length > 0}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis type="number" dataKey="views" name="Views" tick={axisStyle} axisLine={false} tickFormatter={(value) => formatNumber(Number(value))} />
              <YAxis type="number" dataKey="engagement" name="Engajamento" unit="%" tick={axisStyle} axisLine={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => name === 'Engajamento' ? `${Number(value).toFixed(2)}%` : formatNumber(Number(value))} contentStyle={{ background: '#09090b', border: '1px solid #3f3f46', borderRadius: 10 }} />
              <Scatter data={scatterData} fill="#25f4ee" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
