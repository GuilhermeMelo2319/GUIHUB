import { useState, useEffect, useCallback, useRef } from 'react';
import Widget from './Widget';
import { IpInfoIcon } from './Icons';

const IP_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos

export default function IpInfo() {
  const [ip, setIp] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // DNS Lookup
  const [dnsQuery, setDnsQuery] = useState('');
  const [dnsResult, setDnsResult] = useState(null);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsError, setDnsError] = useState('');

  const intervalRef = useRef(null);
  const copiedTimeoutRef = useRef(null);

  // Buscar IP e localização
  const fetchIpInfo = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      setIp(ipData.ip);

      try {
        const locRes = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const locData = await locRes.json();
        setLocation({
          city: locData.city,
          region: locData.region,
          country: locData.country_name,
          isp: locData.org,
          timezone: locData.timezone,
        });
      } catch {
        setLocation(null);
      }
    } catch (err) {
      setError('Não foi possível obter o IP público.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh
  useEffect(() => {
    fetchIpInfo();
    intervalRef.current = setInterval(fetchIpInfo, IP_REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchIpInfo]);

  // Copiar IP
  const handleCopyIp = useCallback(() => {
    if (!ip) return;
    navigator.clipboard.writeText(ip).then(() => {
      setCopied(true);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [ip]);

  // DNS Lookup
  const handleDnsLookup = useCallback(async () => {
    const domain = dnsQuery.trim();
    if (!domain) return;

    setDnsLoading(true);
    setDnsError('');
    setDnsResult(null);

    try {
      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
      const data = await res.json();

      if (data.Answer && data.Answer.length > 0) {
        setDnsResult({
          domain,
          records: data.Answer.map((r) => ({
            ip: r.data,
            ttl: r.TTL,
            type: r.type,
          })),
        });
      } else {
        setDnsError(`Nenhum registro A encontrado para "${domain}".`);
      }
    } catch {
      setDnsError('Erro ao consultar DNS.');
    } finally {
      setDnsLoading(false);
    }
  }, [dnsQuery]);

  const handleDnsKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleDnsLookup();
  }, [handleDnsLookup]);

  return (
    <Widget title="IP / DNS" icon={<IpInfoIcon />}>
      <div className="flex flex-col gap-4">
        {/* IP Info */}
        <div className="flex flex-col gap-2">
          {loading && !ip && (
            <span className="text-sm text-[var(--color-text-muted)] animate-pulse">Buscando IP...</span>
          )}

          {error && (
            <span className="text-sm text-[var(--color-warning)]">⚠️ {error}</span>
          )}

          {ip && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-bold text-[var(--color-text)]">{ip}</span>
                <button
                  onClick={handleCopyIp}
                  className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] hover:bg-[var(--color-surface-lighter)] transition-colors"
                  title="Copiar IP"
                >
                  {copied ? (
                    <svg className="w-4 h-4 stroke-current stroke-[2] fill-none text-[var(--color-success)]" viewBox="0 0 24 24">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>

              {location && (
                <div className="grid grid-cols-1 gap-1 text-xs text-[var(--color-text-muted)]">
                  <div className="flex gap-2">
                    <span>📍</span>
                    <span className="text-[var(--color-text)]">
                      {location.city}, {location.region} — {location.country}
                    </span>
                  </div>
                  {location.isp && (
                    <div className="flex gap-2">
                      <span>🏢</span>
                      <span className="text-[var(--color-text)]">{location.isp}</span>
                    </div>
                  )}
                  {location.timezone && (
                    <div className="flex gap-2">
                      <span>🕐</span>
                      <span className="text-[var(--color-text)]">{location.timezone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* DNS Lookup */}
        <div className="flex flex-col gap-2 pt-3 border-t border-[var(--color-border)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            DNS Lookup
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={dnsQuery}
              onChange={(e) => setDnsQuery(e.target.value)}
              onKeyDown={handleDnsKeyDown}
              placeholder="ex: google.com"
              className="flex-1 bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
            <button
              onClick={handleDnsLookup}
              disabled={dnsLoading}
              className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-3 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-50"
            >
              {dnsLoading ? '...' : 'Buscar'}
            </button>
          </div>

          {dnsError && (
            <span className="text-xs text-[var(--color-warning)]">{dnsError}</span>
          )}

          {dnsResult && (
            <div className="flex flex-col gap-1 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">
                {dnsResult.domain}
              </span>
              {dnsResult.records.map((record, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[var(--color-text)]">{record.ip}</span>
                  <span className="text-[var(--color-text-muted)]">TTL: {record.ttl}s</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refresh manual */}
        <button
          onClick={fetchIpInfo}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition-colors self-center"
        >
          ↻ Atualizar IP
        </button>
      </div>
    </Widget>
  );
}
