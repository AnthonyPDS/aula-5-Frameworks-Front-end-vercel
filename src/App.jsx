import React, { useState, useEffect } from 'react';
import './App.css';

// URL padrão da API (pode ser configurada via variável de ambiente VITE_API_URL ou alterada na interface)
const DEFAULT_API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api/notes'
    : 'https://aula-5-frameworks-front-end.onrender.com/api/notes');

function App() {
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('notas_api_url') || DEFAULT_API_URL;
  });
  const [notas, setNotas] = useState([]);
  const [form, setForm] = useState({ titulo: '', texto: '', id: null });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mostrarConfig, setMostrarConfig] = useState(false);

  useEffect(() => {
    fetchNotas(apiUrl);
  }, [apiUrl]);

  const fetchNotas = async (urlAlvo = apiUrl) => {
    setLoading(true);
    setErro('');
    try {
      const res = await fetch(urlAlvo);
      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
      const data = await res.json();
      setNotas(Array.isArray(data) ? data : []);
    } catch (err) {
      setErro(`Não foi possível conectar em: ${urlAlvo}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titulo || !form.texto) return;

    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `${apiUrl}/${form.id}` : apiUrl;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: form.titulo, texto: form.texto })
      });

      if (res.ok) {
        setForm({ titulo: '', texto: '', id: null });
        fetchNotas();
      }
    } catch (err) {
      setErro('Erro ao salvar a nota. Verifique se a API está rodando.');
    }
  };

  const handleEdit = (nota) => {
    setForm({ titulo: nota.titulo, texto: nota.texto, id: nota.id });
  };

  const handleCancelEdit = () => {
    setForm({ titulo: '', texto: '', id: null });
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      fetchNotas();
    } catch (err) {
      setErro('Erro ao excluir a nota.');
    }
  };

  const handleApiUrlChange = (novaUrl) => {
    const limpa = novaUrl.trim();
    setApiUrl(limpa);
    localStorage.setItem('notas_api_url', limpa);
  };

  return (
    <div className="container">
      <h1>Notas</h1>

      <div className="api-bar">
        <button
          type="button"
          className="api-toggle"
          onClick={() => setMostrarConfig(!mostrarConfig)}
        >
          {mostrarConfig ? 'Ocultar Endpoint da API' : 'Configurar Endpoint da API'}
        </button>

        {mostrarConfig && (
          <div className="api-config">
            <label htmlFor="api-url-input">Endpoint da API (Render ou Local):</label>
            <input
              id="api-url-input"
              type="text"
              value={apiUrl}
              onChange={(e) => handleApiUrlChange(e.target.value)}
              placeholder="https://seu-projeto.onrender.com/api/notes"
            />
            <div className="api-presets">
              <button
                type="button"
                onClick={() => handleApiUrlChange('http://localhost:3000/api/notes')}
              >
                Usar Localhost (3000)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApiUrlChange('https://aula-5-frameworks-front-end.onrender.com/api/notes')
                }
              >
                Usar Render (Anthony)
              </button>
            </div>
          </div>
        )}
      </div>

      {erro && (
        <div className="alert-error">
          <span>{erro}</span>
          <button type="button" onClick={() => setMostrarConfig(true)}>
            Ajustar URL
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <input
          name="titulo"
          placeholder="Título"
          value={form.titulo}
          onChange={handleChange}
          required
          className="input"
        />
        <textarea
          name="texto"
          placeholder="Texto"
          value={form.texto}
          onChange={handleChange}
          required
          className="textarea"
          rows={4}
        />
        <div className="form-actions">
          <button type="submit" className="button">
            {form.id ? 'Atualizar Nota' : 'Criar Nota'}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="button button-secondary"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="status-msg">Carregando notas...</p>
      ) : (
        <div className="notas-grid">
          {notas.map((nota) => (
            <div key={nota.id} className="nota">
              <strong>{nota.titulo}</strong>
              <p>{nota.texto}</p>
              <small>
                {nota.criadoEm
                  ? new Date(nota.criadoEm).toLocaleString('pt-BR')
                  : 'Recém-criada'}
              </small>
              <div className="nota-actions">
                <button onClick={() => handleEdit(nota)} className="button">
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(nota.id)}
                  className="button nota-delete"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
