import { useMemo, useState } from 'react'
import {
  ShieldCheck, Search, LayoutDashboard, Globe, History,
  Settings, AlertTriangle, ShieldAlert, CheckCircle2,
  Activity, ArrowUpRight, ExternalLink, Lock, Menu,
  X, ScanSearch, Clock3
} from 'lucide-react'
import './App.css'

const initialScans = [
  { id: 1, url: 'https://www.google.com', score: 4, level: 'Low', date: 'Demo data' },
  { id: 2, url: 'http://secure-account-login.example.com', score: 78, level: 'High', date: 'Demo data' },
  { id: 3, url: 'https://github.com', score: 2, level: 'Low', date: 'Demo data' },
]

function analyzeUrl(value) {
  let parsed

  
  try {
    parsed = new URL(value.includes('://') ? value : `https://${value}`)

    const hostname = parsed.hostname.toLowerCase()
    const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
    const validIPv4 = isIPv4 && hostname.split('.').every(part => Number(part) <= 255)

    const validDomain =
      hostname.length <= 253 &&
      hostname.includes('.') &&
      hostname.split('.').every(label =>
        label.length >= 1 &&
        label.length <= 63 &&
        /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
      ) &&
      /^[a-z]{2,63}$/.test(hostname.split('.').at(-1))

    if (!validDomain && !validIPv4) {
      throw new Error('Please enter a valid website domain, such as example.com.')
    }
  } catch (error) {
    throw new Error(error.message || 'Please enter a valid website URL.')
  }

  const host = parsed.hostname.toLowerCase()
  const full = value.toLowerCase()
  const findings = []
  let score = 0

  if (parsed.protocol !== 'https:') {
    score += 15
    findings.push('Website does not use HTTPS')
  }

  if (host.startsWith('xn--') || host.includes('.xn--')) {
    score += 25
    findings.push('Internationalized domain name detected')
  }

  if (host.split('.').length > 3) {
    score += 10
    findings.push('Unusually deep subdomain structure')
  }

  if (host.includes('@') || full.includes('@')) {
    score += 25
    findings.push('URL contains an @ symbol')
  }

  if (host.split('-').length >= 3) {
    score += 15
    findings.push('Multiple hyphens in domain name')
  }

  if (/\d{4,}/.test(host)) {
    score += 10
    findings.push('Long numeric sequence in domain')
  }

  const suspiciousWords = ['login', 'verify', 'secure', 'account', 'update', 'support', 'wallet', 'banking']
  const matchedWords = suspiciousWords.filter(word => host.includes(word))

  if (matchedWords.length >= 2) {
    score += 15
    findings.push(`Multiple sensitive keywords in domain: ${matchedWords.join(', ')}`)
  }

  const brands = ['google', 'paypal', 'amazon', 'microsoft', 'apple', 'facebook', 'instagram', 'netflix']
  const brand = brands.find(name => host.includes(name) && !host.endsWith(`${name}.com`) && host !== `${name}.com` && !host.endsWith(`${name}.org`))

  if (brand) {
    score += 30
    findings.push(`Possible ${brand} brand impersonation pattern`)
  }

  score = Math.min(score, 100)

  const level = score >= 70 ? 'Critical' : score >= 45 ? 'High' : score >= 20 ? 'Medium' : 'Low'

  if (!findings.length) findings.push('No obvious suspicious URL patterns detected')

  return {
    url: parsed.href,
    domain: host,
    score,
    level,
    findings,
    recommendation: score >= 70
      ? 'Avoid interacting with this website. Verify the domain through the official brand website.'
      : score >= 45
        ? 'Proceed with caution. Independently verify the website before sharing sensitive information.'
        : score >= 20
          ? 'Review the domain carefully before entering personal information.'
          : 'No obvious URL-based threats were detected. This does not guarantee the website is safe.'
  }
}

function App() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState(initialScans)
  const [active, setActive] = useState('Overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const stats = useMemo(() => ({
    total: history.length,
    threats: history.filter(item => ['High', 'Critical'].includes(item.level)).length,
    safe: history.filter(item => item.level === 'Low').length
  }), [history])

  function handleScan(event) {
    event.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const report = analyzeUrl(url.trim())
      setResult(report)
      setHistory(previous => [
        { ...report, id: Date.now(), date: new Date().toLocaleString() },
        ...previous
      ].slice(0, 20))
      setActive('Scanner')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const navigation = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Scanner', icon: ScanSearch },
    { name: 'Threat History', icon: History },
  ]

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><ShieldCheck size={23} /></div>
          <div><strong>UNWIND</strong><span>BRANDGUARD</span></div>
          <button className="mobile-close" onClick={() => setMenuOpen(false)}><X /></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {navigation.map(item => (
            <button key={item.name} className={`nav-item ${active === item.name ? 'selected' : ''}`}
              onClick={() => { setActive(item.name); setMenuOpen(false) }}>
              <item.icon size={18} /> {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="protection-card">
            <ShieldCheck size={20} />
            <strong>Protection active</strong>
            <span>URL heuristic scanner is ready.</span>
          </div>
          <div className="profile">
            <div className="avatar">U</div>
            <div><strong>Unwind Team</strong><span>Prototype workspace</span></div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)}><Menu /></button>
          <div className="breadcrumb">BrandGuard <span>/</span> {active}</div>
          <div className="top-status"><span className="status-dot" /> Prototype online</div>
        </header>

        <div className="page">
          {active === 'Overview' && <>
            <div className="page-heading">
              <div><div className="eyebrow">SECURITY INTELLIGENCE</div><h1>Overview</h1>
                <p>Monitor suspicious URLs and protect your digital brand presence.</p></div>
              <div className="date-label"><Activity size={15} /> Live workspace</div>
            </div>

            <section className="stats-grid">
              <Stat icon={ScanSearch} label="Total scans" value={stats.total} note="Scans in this session" />
              <Stat icon={ShieldAlert} label="Potential threats" value={stats.threats} note="High or critical indicators" />
              <Stat icon={CheckCircle2} label="Low risk scans" value={stats.safe} note="No major URL indicators" />
              <Stat icon={Activity} label="Detection engine" value="Active" note="Heuristic analysis" />
            </section>

            <section className="scanner-panel">
              <div className="panel-heading">
                <div><div className="eyebrow">URL INTELLIGENCE</div><h2>Scan a website</h2>
                  <p>Analyze a URL for suspicious patterns and possible impersonation.</p></div>
                <div className="scanner-icon"><ScanSearch size={23} /></div>
              </div>
              <form className="scan-form" onSubmit={handleScan}>
                <div className="url-input-wrap"><Globe size={19} />
                  <input value={url} onChange={e => setUrl(e.target.value)}
                    placeholder="Enter a website URL (e.g. https://example.com)" />
                </div>
                <button className="scan-button" disabled={loading || !url.trim()}>
                  <Search size={17} /> {loading ? 'Analyzing...' : 'Analyze URL'}
                </button>
              </form>
              {error && <div className="error-message">{error}</div>}
              <div className="scan-footnote"><Lock size={13} /> URL characteristics are analyzed locally. The submitted website is not opened.</div>
              {result && <Report result={result} />}
            </section>

            <section className="bottom-grid">
              <div className="content-panel">
                <div className="section-title"><div><h2>Recent scans</h2><p>Your latest URL analysis activity</p></div>
                  <button className="text-button" onClick={() => setActive('Threat History')}>View history <ArrowUpRight size={15}/></button>
                </div>
                <ScanTable scans={history.slice(0, 5)} />
              </div>
              <div className="content-panel insight-panel">
                <div className="eyebrow">SECURITY INSIGHT</div>
                <div className="insight-icon"><AlertTriangle size={21}/></div>
                <h2>Look beyond the logo.</h2>
                <p>Fraudulent websites can imitate trusted brands. Check the actual domain carefully before sharing credentials or payment information.</p>
                <div className="insight-tag"><ShieldCheck size={14}/> Stay alert. Stay protected.</div>
              </div>
            </section>
          </>}

          {active === 'Scanner' && <>
            <div className="page-heading"><div><div className="eyebrow">URL INTELLIGENCE</div><h1>Threat Scanner</h1>
              <p>Run a URL assessment and inspect its risk indicators.</p></div></div>
            <section className="scanner-panel standalone">
              <div className="panel-heading"><div><h2>Analyze a website</h2><p>Enter the full URL or domain name below.</p></div><div className="scanner-icon"><ScanSearch size={23}/></div></div>
              <form className="scan-form" onSubmit={handleScan}>
                <div className="url-input-wrap"><Globe size={19}/><input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"/></div>
                <button className="scan-button" disabled={loading || !url.trim()}><Search size={17}/> Analyze URL</button>
              </form>
              {error && <div className="error-message">{error}</div>}
              {result && <Report result={result}/>}
              <div className="scan-footnote"><Lock size={13}/> Local heuristic prototype. No website is fetched.</div>
            </section>
          </>}

          {active === 'Threat History' && <>
            <div className="page-heading"><div><div className="eyebrow">ACTIVITY LOG</div><h1>Threat History</h1>
              <p>Review URLs analyzed in this browser session.</p></div></div>
            <section className="content-panel history-panel"><ScanTable scans={history}/></section>
          </>}
        </div>
        <footer>UNWIND BRANDGUARD <span>·</span> Prototype v0.1 <span>·</span> Heuristic URL analysis, not a verified threat-intelligence service.</footer>
      </main>
    </div>
  )
}

function Stat({ icon: Icon, label, value, note }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><Icon size={18}/></div>
    <strong>{value}</strong><small>{note}</small></div>
}

function Report({ result }) {
  return <div className="report">
    <div className="report-heading"><div><div className="eyebrow">ANALYSIS REPORT</div><h2>Scan results</h2></div>
      <span className={`risk-pill ${result.level.toLowerCase()}`}>{result.level} risk</span></div>
    <div className="report-main">
      <div className="score-circle" style={{ '--score': `${result.score * 3.6}deg` }}>
        <div><strong>{result.score}</strong><span> / 100</span></div><small>Risk score</small>
      </div>
      <div className="report-domain"><span>ANALYZED DOMAIN</span><strong>{result.domain}</strong>
        <p>{result.recommendation}</p></div>
    </div>
    <div className="findings"><strong>Detected indicators</strong>
      {result.findings.map((finding, index) => <div className="finding" key={index}><AlertTriangle size={15}/>{finding}</div>)}
    </div>
    <p className="disclaimer">This score is based on URL patterns only. It is not proof of malicious activity, and a low score does not establish that a website is safe.</p>
  </div>
}

function ScanTable({ scans }) {
  if (!scans.length) return <p className="empty-state">No scans yet. Analyze a URL to get started.</p>
  return <div className="table-wrap"><table><thead><tr><th>WEBSITE</th><th>RISK SCORE</th><th>STATUS</th><th>TIME</th></tr></thead>
    <tbody>{scans.map(scan => <tr key={scan.id}><td><div className="website-cell"><Globe size={16}/>{scan.domain || scan.url}</div></td>
      <td>{scan.score}/100</td><td><span className={`risk-pill ${scan.level.toLowerCase()}`}>{scan.level}</span></td>
      <td className="time-cell"><Clock3 size={13}/>{scan.date}</td></tr>)}</tbody></table></div>
}

export default App