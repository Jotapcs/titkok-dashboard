import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  hasData: boolean;
  children: ReactNode;
};

export function ChartCard({ title, subtitle, hasData, children }: Props) {
  return (
    <article className="panel chart-card">
      <div className="section-heading compact-heading">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="chart-container">
        {hasData ? children : <p className="chart-empty">Sem dados para exibir.</p>}
      </div>
    </article>
  );
}
