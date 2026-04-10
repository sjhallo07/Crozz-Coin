type StatCardProps = {
    label: string;
    value: string;
    hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps)
{
    return (
        <div className="panel stat-card">
            <span className="panel-label">{label}</span>
            <strong>{value}</strong>
            {hint ? <span className="panel-hint">{hint}</span> : null}
        </div>
    );
}
