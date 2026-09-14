import { useState, useEffect, useCallback, useRef } from 'react';
import Widget from './Widget';
import { WeatherIcon } from './Icons';

const STORAGE_KEY_API = 'weather_api_key';
const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutos

export default function Weather() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY_API) || '');
  const [apiInput, setApiInput] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  const fetchWeather = useCallback((key) => {
    if (!key) return;

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric&lang=pt_br`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric&lang=pt_br&cnt=8`;

        Promise.all([
          fetch(currentUrl).then((res) => {
            if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
            return res.json();
          }),
          fetch(forecastUrl).then((res) => {
            if (!res.ok) throw new Error(`Erro forecast ${res.status}: ${res.statusText}`);
            return res.json();
          }),
        ])
          .then(([currentData, forecastData]) => {
            setWeather({
              temp: Math.round(currentData.main.temp),
              tempMin: Math.round(currentData.main.temp_min),
              tempMax: Math.round(currentData.main.temp_max),
              humidity: currentData.main.humidity,
              description: currentData.weather[0].description,
              icon: currentData.weather[0].icon,
              wind: currentData.wind.speed,
              city: currentData.name,
            });

            setForecast(
              forecastData.list.map((item) => ({
                time: new Date(item.dt * 1000).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                temp: Math.round(item.main.temp),
                icon: item.weather[0].icon,
                description: item.weather[0].description,
              }))
            );

            setLoading(false);
          })
          .catch((err) => {
            setError(err.message || 'Erro ao buscar dados do clima');
            setLoading(false);
          });
      },
      (geoErr) => {
        setError('Não foi possível obter sua localização. Verifique as permissões do navegador.');
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (apiKey) {
      fetchWeather(apiKey);
      intervalRef.current = setInterval(() => fetchWeather(apiKey), UPDATE_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [apiKey, fetchWeather]);

  const handleSaveKey = useCallback(() => {
    const trimmed = apiInput.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY_API, trimmed);
      setApiKey(trimmed);
      setApiInput('');
    }
  }, [apiInput]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleSaveKey();
  }, [handleSaveKey]);

  const handleRemoveKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_API);
    setApiKey('');
    setWeather(null);
    setForecast(null);
    setError('');
  }, []);

  if (!apiKey) {
    return (
      <Widget title="Clima" icon={<WeatherIcon />}>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--color-text-muted)]">
            Configure sua chave da API OpenWeatherMap para ver o clima.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiInput}
              onChange={(e) => setApiInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cole sua API key aqui"
              className="flex-1 bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
            <button
              onClick={handleSaveKey}
              className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      </Widget>
    );
  }

  return (
    <Widget title="Clima" icon={<WeatherIcon />}>
      {loading && !weather && (
        <div className="flex items-center justify-center py-4">
          <span className="text-[var(--color-text-muted)] text-sm animate-pulse">Carregando...</span>
        </div>
      )}

      {error && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-[var(--color-warning)]">⚠️ {error}</p>
          <button
            onClick={handleRemoveKey}
            className="text-xs text-[var(--color-text-muted)] underline hover:text-[var(--color-text)] self-start"
          >
            Reconfigurar API key
          </button>
        </div>
      )}

      {weather && !error && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              className="w-14 h-14"
            />
            <div>
              <div className="text-3xl font-bold text-[var(--color-text)]">{weather.temp}°C</div>
              <div className="text-sm text-[var(--color-text-muted)] capitalize">{weather.description}</div>
            </div>
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">{weather.city}</div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-[var(--color-text-muted)]">
            <div className="flex flex-col items-center gap-0.5">
              <span>🌡️ Min/Max</span>
              <span className="text-[var(--color-text)]">{weather.tempMin}° / {weather.tempMax}°</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span>💧 Umidade</span>
              <span className="text-[var(--color-text)]">{weather.humidity}%</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span>💨 Vento</span>
              <span className="text-[var(--color-text)]">{weather.wind} m/s</span>
            </div>
          </div>

          {/* Previsão hora a hora */}
          {forecast && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Próximas horas</p>
              <div className="flex flex-row gap-3 overflow-x-auto pb-1">
                {forecast.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-shrink-0">
                    <span className="text-xs text-[var(--color-text-muted)]">{item.time}</span>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                      alt={item.description}
                      className="w-8 h-8"
                    />
                    <span className="text-xs font-medium text-[var(--color-text)]">{item.temp}°</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleRemoveKey}
            className="mt-2 text-xs text-[var(--color-text-muted)] underline hover:text-[var(--color-text)] self-end"
          >
            Reconfigurar
          </button>
        </div>
      )}
    </Widget>
  );
}
