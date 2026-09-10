import { useState } from 'react'

const TEST_CASES = [
  { label: "1. Kamala - End of Ep 5", character: "Kamala", episode: 5, prompt: "Kamala confronts Dev in the empty auditorium about whether he still wants to be here." },
  { label: "2. Kamala - End of Ep 4", character: "Kamala", episode: 4, prompt: "Kamala goes over what she saw in the car park." },
  { label: "3. Tomas - End of Ep 5", character: "Tomas", episode: 5, prompt: "Tomas walks through the empty auditorium the morning after signing the sale agreement." },
  { label: "4. Priya - End of Ep 5", character: "Priya", episode: 5, prompt: "Priya writes up her notes after the dress rehearsal." },
  { label: "5. Wren - End of Ep 6", character: "Wren", episode: 6, prompt: "Wren walks home after closing night, thinking about next season." },
  { label: "6. Wren - End of Ep 5", character: "Wren", episode: 5, prompt: "Wren tries to work out why Kamala has been so distracted lately." }
]

export default function App() {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<string>("")
  const [character, setCharacter] = useState("Kamala")
  const [episode, setEpisode] = useState(1)
  const [prompt, setPrompt] = useState("")
  
  // Standard in-memory state: Clears on page refresh, persists on tab switches
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearResult = () => {
    setResult(null)
  }

  const handlePresetSelect = (val: string) => {
    setSelectedPresetIndex(val)
    if (val === "") {
      setPrompt("")
      clearResult()
      return
    }
    const tc = TEST_CASES[Number(val)]
    setCharacter(tc.character)
    setEpisode(tc.episode)
    setPrompt(tc.prompt)
    clearResult()
  }

  const handleCharacterChange = (newChar: string) => {
    setCharacter(newChar)
    setSelectedPresetIndex("")
    clearResult()
  }

  const handleEpisodeChange = (newEp: number) => {
    setEpisode(newEp)
    setSelectedPresetIndex("")
    clearResult()
  }

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt)
    setSelectedPresetIndex("")
  }

  const handleGenerate = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!prompt.trim()) {
      setError("Please enter a scene prompt or select a preset.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character, episode_boundary: episode, prompt })
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch scene')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h1 style={styles.header}>Story scene Narrator Engine</h1>
        
        <div style={styles.layout}>
          {/* Controls Panel */}
          <div style={styles.controls}>
            <div>
              <label style={styles.label}>Point in the Story (Episodes) </label>
              <select 
                value={selectedPresetIndex} 
                onChange={e => handlePresetSelect(e.target.value)} 
                style={styles.input}
              >
                <option value="" style={styles.option}>-- Select Preset or Enter Custom --</option>
                {TEST_CASES.map((tc, i) => (
                  <option key={i} value={i} style={styles.option}>{tc.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Character Perspective</label>
              <select 
                value={character} 
                onChange={e => handleCharacterChange(e.target.value)} 
                style={styles.input}
              >
                <option style={styles.option}>Kamala</option>
                <option style={styles.option}>Tomas</option>
                <option style={styles.option}>Dev</option>
                <option style={styles.option}>Priya</option>
                <option style={styles.option}>Wren</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>Episode Boundary: {episode}</label>
              <input 
                type="range" 
                min="1" 
                max="6" 
                value={episode} 
                onChange={e => handleEpisodeChange(Number(e.target.value))} 
                style={styles.rangeInput} 
              />
            </div>

            <div>
              <label style={styles.label}>Scene Prompt</label>
              <textarea 
                rows={4} 
                placeholder="Type any prompt or select a preset above..."
                value={prompt} 
                onChange={e => handlePromptChange(e.target.value)} 
                style={styles.textarea} 
              />
            </div>

            <button 
              type="button" 
              onClick={handleGenerate} 
              disabled={loading} 
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Drafting Scene within Constraints' : 'Generate Scene'}
            </button>
          </div>

          {/* Output Panel */}
          <div style={styles.output}>
            {error && <div style={styles.errorBox}>{error}</div>}
            
            {result && (
              <>
                <div style={styles.trustPanel}>
                  <h3 style={styles.trustPanelHeader}>Known Events from the Story </h3>
                  <ul style={styles.factList}>
                    {result.permitted_facts?.map((f: string, i: number) => (
                      <li key={i} style={styles.factItem}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 style={styles.sceneHeader}>Generated Scene:</h3>
                  <div style={styles.sceneText}>
                    {result.scene}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  container: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  header: {
    borderBottom: '1px solid #334155',
    paddingBottom: '12px',
    margin: 0,
    fontSize: '1.75rem',
    color: '#f1f5f9'
  },
  layout: {
    display: 'flex',
    gap: '2rem',
    marginTop: '2rem',
    alignItems: 'flex-start'
  },
  controls: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  output: {
    flex: '2',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  label: {
    fontWeight: '600',
    display: 'block',
    marginBottom: '6px',
    fontSize: '0.9rem',
    color: '#94a3b8'
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    boxSizing: 'border-box',
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    border: '1px solid #334155',
    borderRadius: '6px',
    fontSize: '0.95rem'
  },
  option: {
    backgroundColor: '#1e293b',
    color: '#f8fafc'
  },
  rangeInput: {
    width: '100%',
    accentColor: '#38bdf8',
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    boxSizing: 'border-box',
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    border: '1px solid #334155',
    borderRadius: '6px',
    fontSize: '0.95rem',
    lineHeight: '1.4',
    resize: 'vertical'
  },
  button: {
    padding: '0.8rem',
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '0.95rem'
  },
  errorBox: {
    color: '#f87171',
    padding: '1rem',
    backgroundColor: '#450a0a',
    border: '1px solid #7f1d1d',
    borderRadius: '6px'
  },
  trustPanel: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    padding: '1.2rem',
    borderRadius: '6px'
  },
  trustPanelHeader: {
    margin: '0 0 10px 0',
    fontSize: '0.95rem',
    color: '#38bdf8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  factList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#cbd5e1',
    fontSize: '0.9rem',
    lineHeight: '1.5'
  },
  factItem: {
    marginBottom: '6px'
  },
  sceneHeader: {
    margin: '0 0 10px 0',
    fontSize: '1.15rem',
    color: '#f1f5f9'
  },
  sceneText: {
    whiteSpace: 'pre-line',
    lineHeight: '1.7',
    color: '#e2e8f0',
    backgroundColor: '#1e293b',
    padding: '1.25rem',
    borderRadius: '6px',
    border: '1px solid #334155'
  }
}