import React, { useState, useEffect, useCallback, useRef } from 'react';
import Widget from './Widget';

// ─── Banco de Palavras ────────────────────────────────────────────────────────
const WORD_BANK = [
  // Saudações
  { es: 'hola', pt: 'olá', category: 'saudações' },
  { es: 'buenos días', pt: 'bom dia', category: 'saudações' },
  { es: 'buenas tardes', pt: 'boa tarde', category: 'saudações' },
  { es: 'buenas noches', pt: 'boa noite', category: 'saudações' },
  { es: 'adiós', pt: 'adeus', category: 'saudações' },
  { es: 'gracias', pt: 'obrigado', category: 'saudações' },
  { es: 'por favor', pt: 'por favor', category: 'saudações' },
  { es: 'de nada', pt: 'de nada', category: 'saudações' },
  { es: 'perdón', pt: 'perdão', category: 'saudações' },
  { es: 'lo siento', pt: 'desculpe', category: 'saudações' },
  { es: 'hasta luego', pt: 'até logo', category: 'saudações' },
  { es: 'hasta mañana', pt: 'até amanhã', category: 'saudações' },
  { es: 'bienvenido', pt: 'bem-vindo', category: 'saudações' },
  { es: 'mucho gusto', pt: 'muito prazer', category: 'saudações' },
  { es: 'salud', pt: 'saúde', category: 'saudações' },

  // Comida
  { es: 'agua', pt: 'água', category: 'comida' },
  { es: 'pan', pt: 'pão', category: 'comida' },
  { es: 'leche', pt: 'leite', category: 'comida' },
  { es: 'carne', pt: 'carne', category: 'comida' },
  { es: 'arroz', pt: 'arroz', category: 'comida' },
  { es: 'pollo', pt: 'frango', category: 'comida' },
  { es: 'cerveza', pt: 'cerveja', category: 'comida' },
  { es: 'vino', pt: 'vinho', category: 'comida' },
  { es: 'queso', pt: 'queijo', category: 'comida' },
  { es: 'huevo', pt: 'ovo', category: 'comida' },
  { es: 'pescado', pt: 'peixe', category: 'comida' },
  { es: 'fruta', pt: 'fruta', category: 'comida' },
  { es: 'verdura', pt: 'verdura', category: 'comida' },
  { es: 'azúcar', pt: 'açúcar', category: 'comida' },
  { es: 'sal', pt: 'sal', category: 'comida' },
  { es: 'café', pt: 'café', category: 'comida' },
  { es: 'jugo', pt: 'suco', category: 'comida' },
  { es: 'ensalada', pt: 'salada', category: 'comida' },
  { es: 'sopa', pt: 'sopa', category: 'comida' },
  { es: 'postre', pt: 'sobremesa', category: 'comida' },

  // Viagem
  { es: 'aeropuerto', pt: 'aeroporto', category: 'viagem' },
  { es: 'hotel', pt: 'hotel', category: 'viagem' },
  { es: 'playa', pt: 'praia', category: 'viagem' },
  { es: 'calle', pt: 'rua', category: 'viagem' },
  { es: 'ciudad', pt: 'cidade', category: 'viagem' },
  { es: 'tren', pt: 'trem', category: 'viagem' },
  { es: 'autobús', pt: 'ônibus', category: 'viagem' },
  { es: 'avión', pt: 'avião', category: 'viagem' },
  { es: 'equipaje', pt: 'bagagem', category: 'viagem' },
  { es: 'pasaporte', pt: 'passaporte', category: 'viagem' },
  { es: 'billete', pt: 'bilhete', category: 'viagem' },
  { es: 'estación', pt: 'estação', category: 'viagem' },
  { es: 'mapa', pt: 'mapa', category: 'viagem' },
  { es: 'museo', pt: 'museu', category: 'viagem' },
  { es: 'restaurante', pt: 'restaurante', category: 'viagem' },
  { es: 'tienda', pt: 'loja', category: 'viagem' },
  { es: 'mercado', pt: 'mercado', category: 'viagem' },
  { es: 'hospital', pt: 'hospital', category: 'viagem' },
  { es: 'farmacia', pt: 'farmácia', category: 'viagem' },

  // Trabalho
  { es: 'reunión', pt: 'reunião', category: 'trabalho' },
  { es: 'oficina', pt: 'escritório', category: 'trabalho' },
  { es: 'computadora', pt: 'computador', category: 'trabalho' },
  { es: 'correo', pt: 'e-mail', category: 'trabalho' },
  { es: 'proyecto', pt: 'projeto', category: 'trabalho' },
  { es: 'trabajo', pt: 'trabalho', category: 'trabalho' },
  { es: 'empresa', pt: 'empresa', category: 'trabalho' },
  { es: 'jefe', pt: 'chefe', category: 'trabalho' },
  { es: 'empleado', pt: 'empregado', category: 'trabalho' },
  { es: 'sueldo', pt: 'salário', category: 'trabalho' },
  { es: 'horario', pt: 'horário', category: 'trabalho' },
  { es: 'vacaciones', pt: 'férias', category: 'trabalho' },
  { es: 'contrato', pt: 'contrato', category: 'trabalho' },
  { es: 'entrevista', pt: 'entrevista', category: 'trabalho' },

  // Dia a dia
  { es: 'casa', pt: 'casa', category: 'dia a dia' },
  { es: 'coche', pt: 'carro', category: 'dia a dia' },
  { es: 'perro', pt: 'cachorro', category: 'dia a dia' },
  { es: 'gato', pt: 'gato', category: 'dia a dia' },
  { es: 'libro', pt: 'livro', category: 'dia a dia' },
  { es: 'teléfono', pt: 'telefone', category: 'dia a dia' },
  { es: 'tiempo', pt: 'tempo', category: 'dia a dia' },
  { es: 'dinero', pt: 'dinheiro', category: 'dia a dia' },
  { es: 'familia', pt: 'família', category: 'dia a dia' },
  { es: 'amigo', pt: 'amigo', category: 'dia a dia' },
  { es: 'niño', pt: 'criança', category: 'dia a dia' },
  { es: 'mujer', pt: 'mulher', category: 'dia a dia' },
  { es: 'hombre', pt: 'homem', category: 'dia a dia' },
  { es: 'cama', pt: 'cama', category: 'dia a dia' },
  { es: 'puerta', pt: 'porta', category: 'dia a dia' },
  { es: 'ventana', pt: 'janela', category: 'dia a dia' },
  { es: 'ropa', pt: 'roupa', category: 'dia a dia' },
  { es: 'zapatos', pt: 'sapatos', category: 'dia a dia' },
  { es: 'llave', pt: 'chave', category: 'dia a dia' },
  { es: 'reloj', pt: 'relógio', category: 'dia a dia' },

  // Verbos
  { es: 'ser', pt: 'ser', category: 'verbos' },
  { es: 'estar', pt: 'estar', category: 'verbos' },
  { es: 'tener', pt: 'ter', category: 'verbos' },
  { es: 'hacer', pt: 'fazer', category: 'verbos' },
  { es: 'ir', pt: 'ir', category: 'verbos' },
  { es: 'venir', pt: 'vir', category: 'verbos' },
  { es: 'comer', pt: 'comer', category: 'verbos' },
  { es: 'dormir', pt: 'dormir', category: 'verbos' },
  { es: 'hablar', pt: 'falar', category: 'verbos' },
  { es: 'escribir', pt: 'escrever', category: 'verbos' },
  { es: 'leer', pt: 'ler', category: 'verbos' },
  { es: 'vivir', pt: 'viver', category: 'verbos' },
  { es: 'trabajar', pt: 'trabalhar', category: 'verbos' },
  { es: 'estudiar', pt: 'estudar', category: 'verbos' },
  { es: 'comprar', pt: 'comprar', category: 'verbos' },
  { es: 'vender', pt: 'vender', category: 'verbos' },
  { es: 'abrir', pt: 'abrir', category: 'verbos' },
  { es: 'cerrar', pt: 'fechar', category: 'verbos' },
  { es: 'pensar', pt: 'pensar', category: 'verbos' },
  { es: 'querer', pt: 'querer', category: 'verbos' },
  { es: 'poder', pt: 'poder', category: 'verbos' },
  { es: 'saber', pt: 'saber', category: 'verbos' },
  { es: 'poner', pt: 'colocar', category: 'verbos' },
  { es: 'salir', pt: 'sair', category: 'verbos' },
  { es: 'llegar', pt: 'chegar', category: 'verbos' },
  { es: 'llamar', pt: 'chamar', category: 'verbos' },
  { es: 'encontrar', pt: 'encontrar', category: 'verbos' },

  // Frases
  { es: '¿Cómo estás?', pt: 'Como você está?', category: 'frases' },
  { es: '¿Dónde está el baño?', pt: 'Onde fica o banheiro?', category: 'frases' },
  { es: 'Me gustaría un café', pt: 'Eu gostaria de um café', category: 'frases' },
  { es: 'No entiendo', pt: 'Não entendo', category: 'frases' },
  { es: '¿Cuánto cuesta?', pt: 'Quanto custa?', category: 'frases' },
  { es: '¿Qué hora es?', pt: 'Que horas são?', category: 'frases' },
  { es: 'Tengo hambre', pt: 'Estou com fome', category: 'frases' },
  { es: 'Tengo sed', pt: 'Estou com sede', category: 'frases' },
  { es: '¿Hablas portugués?', pt: 'Você fala português?', category: 'frases' },
  { es: 'Necesito ayuda', pt: 'Preciso de ajuda', category: 'frases' },
  { es: '¿Puedes repetir?', pt: 'Pode repetir?', category: 'frases' },
  { es: 'Estoy perdido', pt: 'Estou perdido', category: 'frases' },
  { es: 'Me llamo...', pt: 'Meu nome é...', category: 'frases' },
  { es: '¿Dónde está la estación?', pt: 'Onde fica a estação?', category: 'frases' },
  { es: 'La cuenta, por favor', pt: 'A conta, por favor', category: 'frases' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalize = (str) =>
  str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿¡?!.,]/g, '');

const STORAGE_KEY = 'guihub-languages';

const loadStats = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { totalCorrect: 0, totalWrong: 0, streak: 0, bestStreak: 0 };
};

const saveStats = (stats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
};

// ─── Componente ───────────────────────────────────────────────────────────────
function Languages() {
  const [mode, setMode] = useState('es-pt'); // 'es-pt' ou 'pt-es'
  const [currentWord, setCurrentWord] = useState(null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null); // { correct, answer }
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [stats, setStats] = useState(loadStats);

  const inputRef = useRef(null);

  const pickRandomWord = useCallback(() => {
    const idx = Math.floor(Math.random() * WORD_BANK.length);
    setCurrentWord(WORD_BANK[idx]);
    setInput('');
    setFeedback(null);
  }, []);

  useEffect(() => {
    pickRandomWord();
  }, [pickRandomWord]);

  useEffect(() => {
    if (!feedback && inputRef.current) {
      inputRef.current.focus();
    }
  }, [feedback, currentWord]);

  const getQuestion = () => {
    if (!currentWord) return '';
    return mode === 'es-pt' ? currentWord.es : currentWord.pt;
  };

  const getExpectedAnswer = () => {
    if (!currentWord) return '';
    return mode === 'es-pt' ? currentWord.pt : currentWord.es;
  };

  const checkAnswer = () => {
    if (!input.trim() || feedback) return;
    const expected = getExpectedAnswer();
    const isCorrect = normalize(input) === normalize(expected);

    setFeedback({ correct: isCorrect, answer: expected });
    setSessionScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    setStats((prev) => {
      const updated = {
        ...prev,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        totalWrong: prev.totalWrong + (isCorrect ? 0 : 1),
        streak: isCorrect ? prev.streak + 1 : 0,
        bestStreak: isCorrect ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
      };
      saveStats(updated);
      return updated;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (feedback) {
        pickRandomWord();
      } else {
        checkAnswer();
      }
    }
  };

  const accuracy = stats.totalCorrect + stats.totalWrong > 0
    ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100)
    : 0;

  const icon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h6" />
    </svg>
  );

  return (
    <Widget title="Idiomas" icon={icon} contentAlign="center">
      <div style={styles.container}>
        {/* Estatísticas do topo */}
        <div style={styles.statsBar}>
          <span style={styles.statItem}>
            🎯 {sessionScore.correct}/{sessionScore.total}
          </span>
          <span style={styles.statItem}>
            🔥 {stats.streak}
          </span>
          <span style={styles.statItem}>
            📊 {accuracy}%
          </span>
        </div>

        {/* Toggle de modo */}
        <div style={styles.modeToggle}>
          <button
            style={{
              ...styles.modeBtn,
              ...(mode === 'es-pt' ? styles.modeBtnActive : {}),
            }}
            onClick={() => { setMode('es-pt'); pickRandomWord(); }}
          >
            ES → PT
          </button>
          <button
            style={{
              ...styles.modeBtn,
              ...(mode === 'pt-es' ? styles.modeBtnActive : {}),
            }}
            onClick={() => { setMode('pt-es'); pickRandomWord(); }}
          >
            PT → ES
          </button>
        </div>

        {/* Categoria */}
        {currentWord && (
          <div style={styles.category}>
            {currentWord.category}
          </div>
        )}

        {/* Palavra / Pergunta */}
        <div style={styles.wordDisplay}>
          {getQuestion()}
        </div>

        {/* Input */}
        <div style={styles.inputRow}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'es-pt' ? 'Tradução em português...' : 'Traducción en español...'}
            style={{
              ...styles.input,
              ...(feedback
                ? feedback.correct
                  ? styles.inputCorrect
                  : styles.inputWrong
                : {}),
            }}
            disabled={!!feedback}
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        {/* Feedback */}
        {feedback && (
          <div style={{
            ...styles.feedback,
            ...(feedback.correct ? styles.feedbackCorrect : styles.feedbackWrong),
          }}>
            {feedback.correct ? (
              <span>✅ Correto!</span>
            ) : (
              <span>❌ Resposta: <strong>{feedback.answer}</strong></span>
            )}
          </div>
        )}

        {/* Botões */}
        <div style={styles.actions}>
          {!feedback ? (
            <>
              <button style={styles.btnPrimary} onClick={checkAnswer} disabled={!input.trim()}>
                Confirmar
              </button>
              <button style={styles.btnSecondary} onClick={pickRandomWord}>
                Pular
              </button>
            </>
          ) : (
            <button style={styles.btnPrimary} onClick={pickRandomWord}>
              Próxima
            </button>
          )}
        </div>

        {/* Estatísticas detalhadas */}
        <div style={styles.detailedStats}>
          <span>Total: {stats.totalCorrect + stats.totalWrong} tentativas</span>
          <span>Acertos: {stats.totalCorrect}</span>
          <span>Erros: {stats.totalWrong}</span>
          <span>Melhor streak: {stats.bestStreak}</span>
        </div>
      </div>
    </Widget>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '4px 0',
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    fontSize: '14px',
    opacity: 0.9,
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  modeToggle: {
    display: 'flex',
    justifyContent: 'center',
    gap: '4px',
    background: 'var(--bg-tertiary, #1a1a2e)',
    borderRadius: '8px',
    padding: '4px',
  },
  modeBtn: {
    padding: '6px 16px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    color: 'var(--text-secondary, #a0a0b0)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  modeBtnActive: {
    background: 'var(--accent-primary, #6c63ff)',
    color: '#fff',
  },
  category: {
    textAlign: 'center',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--text-tertiary, #666680)',
  },
  wordDisplay: {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: '700',
    padding: '16px 8px',
    color: 'var(--text-primary, #e0e0e0)',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '2px solid var(--border-primary, #2a2a3e)',
    background: 'var(--bg-secondary, #12121a)',
    color: 'var(--text-primary, #e0e0e0)',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputCorrect: {
    borderColor: '#4caf50',
    background: 'rgba(76, 175, 80, 0.08)',
  },
  inputWrong: {
    borderColor: '#f44336',
    background: 'rgba(244, 67, 54, 0.08)',
  },
  feedback: {
    textAlign: 'center',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  feedbackCorrect: {
    background: 'rgba(76, 175, 80, 0.12)',
    color: '#66bb6a',
  },
  feedbackWrong: {
    background: 'rgba(244, 67, 54, 0.12)',
    color: '#ef5350',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  btnPrimary: {
    padding: '8px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--accent-primary, #6c63ff)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  btnSecondary: {
    padding: '8px 20px',
    borderRadius: '8px',
    border: '1px solid var(--border-primary, #2a2a3e)',
    background: 'transparent',
    color: 'var(--text-secondary, #a0a0b0)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  detailedStats: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '12px',
    fontSize: '11px',
    color: 'var(--text-tertiary, #666680)',
    borderTop: '1px solid var(--border-primary, #2a2a3e)',
    paddingTop: '10px',
  },
};

export default Languages;
