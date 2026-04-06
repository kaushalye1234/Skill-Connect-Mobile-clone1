import { useState } from 'react'

const today = new Date().toISOString().split('T')[0]

const ALL_TECH = ['React', 'Node.js', 'Express', 'MongoDB', 'Capacitor', 'Android', 'JWT', 'Mongoose']
const ALL_USERS = ['Customers', 'Workers', 'Suppliers', 'Admins']

function SubmissionForm() {
  // ── Core State ──────────────────────────────────────────────────────────
  const [groupNumber, setGroupNumber] = useState('WD_SE_01_01')
  const [githubUrl, setGithubUrl] = useState('')
  const [backendUrl, setBackendUrl] = useState('')
  const [projectName, setProjectName] = useState('SkillConnect')
  const [description, setDescription] = useState('')
  const [problemDescription, setProblemDescription] = useState('')
  const [targetUsers, setTargetUsers] = useState([])
  const [coreFeatures, setCoreFeatures] = useState('')
  const [techStack, setTechStack] = useState([...ALL_TECH])

  const [members, setMembers] = useState([
    { itNumber: 'IT24300049', name: 'Awfadh M.I.M.M.L',        module: 'Project Lead / Backend Lead' },
    { itNumber: 'IT24102519', name: 'Balasooriya Arachige C.K', module: 'Backend Developer' },
    { itNumber: 'IT24102755', name: 'Dewmini G.D.C.P',          module: 'Frontend Developer' },
    { itNumber: 'IT24101770', name: 'Mithunalinni R',           module: 'Frontend Developer / UI UX' },
    { itNumber: 'IT24101345', name: 'Sasmitha M.G.Y',           module: 'QA Lead / DevOps / Documentation' },
  ])

  const [moduleCode, setModuleCode] = useState('SE2020')
  const [assignmentTitle, setAssignmentTitle] = useState('WDDS01')
  const [submissionDate, setSubmissionDate] = useState(today)

  const [activeTab, setActiveTab] = useState('readme')
  const [generated, setGenerated] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [copiedTab, setCopiedTab] = useState('')

  // ── Helpers ──────────────────────────────────────────────────────────────
  const toggleChip = (list, setList, value) => {
    setList(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const updateMember = (idx, field, val) => {
    setMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: val } : m))
  }

  const addMember = () => {
    if (members.length < 6) setMembers(prev => [...prev, { itNumber: '', name: '', module: '' }])
  }

  const removeMember = idx => {
    setMembers(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Validation ────────────────────────────────────────────────────────
  const validate = () => {
    const errors = {}
    if (!groupNumber.trim()) errors.groupNumber = 'Group number is required'
    if (!githubUrl.trim()) {
      errors.githubUrl = 'GitHub URL is required'
    } else if (!githubUrl.startsWith('https://')) {
      errors.githubUrl = 'GitHub URL must start with https://'
    }
    const validMembers = members.filter(m => m.itNumber.trim() && m.name.trim())
    if (validMembers.length === 0) errors.members = 'At least one member with IT Number and Name is required'
    return errors
  }

  // ── Document Generators ───────────────────────────────────────────────
  const validMembers = members.filter(m => m.itNumber.trim() && m.name.trim())

  const generateReadme = () => {
    const lines = [
      '================================',
      `${moduleCode} - ${assignmentTitle} Submission`,
      `Group ${groupNumber}`,
      '================================',
      '',
      '01). GitHub Repository Link',
      `GitHub Repository: ${githubUrl}`,
      '',
      '02). Team Details',
      `Group Number: ${groupNumber}`,
      ...validMembers.map((m, i) => `Member ${i + 1}: ${m.itNumber} – ${m.name} – ${m.module}`),
      '',
      '03). Deployment Details',
      `Backend URL: ${backendUrl || '[Not yet deployed]'}`,
      '',
      '04). Project',
      `Project Name: ${projectName}`,
      `Description: ${description}`,
      '================================',
    ]
    return lines.join('\n')
  }

  const generateTeamResp = () => {
    const nameW  = Math.max(16, ...validMembers.map(m => m.name.length)) + 2
    const itW    = Math.max(12, ...validMembers.map(m => m.itNumber.length)) + 2
    const modW   = Math.max(14, ...validMembers.map(m => m.module.length)) + 2

    const pad = (str, len) => str.padEnd(len)
    const sep = `${'-'.repeat(nameW)}|${'-'.repeat(itW)}|${'-'.repeat(modW)}`
    const header = `${pad('Member', nameW)}| ${pad('IT Number', itW - 1)}| ${pad('Responsibility', modW - 1)}`

    const rows = validMembers.map(m =>
      `${pad(m.name, nameW)}| ${pad(m.itNumber, itW - 1)}| ${pad(m.module, modW - 1)}`
    )

    return [
      `${moduleCode} – Team Responsibility`,
      `Group ${groupNumber} – ${projectName}`,
      '================================',
      header,
      sep,
      ...rows,
      '',
      'Shared Responsibilities:',
      '- All members participated in testing',
      '- All members contributed to documentation',
      '- Code reviews conducted collectively',
      '================================',
    ].join('\n')
  }

  const generateProblemStatement = () => {
    const featureLines = coreFeatures
      .split(',')
      .map(f => f.trim())
      .filter(Boolean)
      .map((f, i) => `   ${i + 1}. ${f}`)
      .join('\n')

    return [
      `${moduleCode} – Problem Statement`,
      projectName,
      `Group ${groupNumber}`,
      '================================',
      '',
      '1. Problem Overview',
      problemDescription || '[Describe the problem here]',
      '',
      '2. Target Users',
      targetUsers.length ? targetUsers.map(u => `   - ${u}`).join('\n') : '   [Select target users above]',
      '',
      '3. Proposed Solution',
      `${projectName} is a mobile marketplace application that ${description || '[description]'}.`,
      '',
      '4. Core Features',
      featureLines || '   [Add core features above]',
      '',
      '5. Technology Stack',
      techStack.length ? techStack.map(t => `   - ${t}`).join('\n') : '   [Select technologies above]',
      '',
      '6. Expected Outcome',
      `The platform aims to digitise and streamline the process of connecting`,
      `customers with skilled workers and equipment suppliers in Sri Lanka.`,
      '================================',
    ].join('\n')
  }

  // ── Handlers ────────────────────────────────────────────────────────
  const handleGenerate = () => {
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length === 0) {
      setGenerated(true)
      setTimeout(() => {
        document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const handleCopy = (text, tab) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTab(tab)
      setTimeout(() => setCopiedTab(''), 2000)
    })
  }

  const handleDownload = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const readme  = generated ? generateReadme()          : ''
  const teamDoc = generated ? generateTeamResp()        : ''
  const probDoc = generated ? generateProblemStatement() : ''

  const tabs = [
    { id: 'readme', label: 'README.txt',        content: readme,  file: 'README.txt' },
    { id: 'team',   label: 'Team Responsibility', content: teamDoc, file: 'Team_Responsibility.txt' },
    { id: 'prob',   label: 'Problem Statement',  content: probDoc, file: 'Problem_Statement.txt' },
  ]

  const activeContent = tabs.find(t => t.id === activeTab)

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <header className="page-header">
        <h1>📋 SE2020 Submission Details</h1>
        <p>Fill in your details to generate submission documents</p>
      </header>

      <div className="page-body">

        {/* ── Section 1: Group Info ── */}
        <div className="card">
          <div className="card-title">
            🗂️ Group Details
            <span className="badge">Section 1</span>
          </div>

          <div className="form-group">
            <label className="form-label">Group Number <span className="req">*</span></label>
            <input
              id="groupNumber"
              className={`form-control ${fieldErrors.groupNumber ? 'error' : ''}`}
              value={groupNumber}
              onChange={e => setGroupNumber(e.target.value)}
              placeholder="e.g. WD_SE_01_01"
            />
            {fieldErrors.groupNumber && <div className="form-error">⚠ {fieldErrors.groupNumber}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">GitHub Repository Link <span className="req">*</span></label>
            <input
              id="githubUrl"
              type="url"
              className={`form-control ${fieldErrors.githubUrl ? 'error' : ''}`}
              value={githubUrl}
              onChange={e => setGithubUrl(e.target.value)}
              placeholder="https://github.com/your-repo"
            />
            {fieldErrors.githubUrl && <div className="form-error">⚠ {fieldErrors.githubUrl}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Backend Deployment URL</label>
            <input
              id="backendUrl"
              type="url"
              className="form-control"
              value={backendUrl}
              onChange={e => setBackendUrl(e.target.value)}
              placeholder="https://your-api.onrender.com"
            />
            <div className="form-helper">Deploy to Render/Railway to get this URL</div>
            {!backendUrl && (
              <div className="form-warning">
                ⚠ Add deployment URL before final submission
              </div>
            )}
          </div>
        </div>

        {/* ── Section 2: Team Members ── */}
        <div className="card">
          <div className="card-title">
            👥 Team Members
            <span className="badge">up to 6</span>
          </div>

          <div className="section-label">IT Number · Full Name · Role / Module</div>

          {members.map((m, i) => (
            <div className="member-row" key={i}>
              <div className="member-num">{i + 1}</div>
              <input
                className={`form-control it-input ${fieldErrors.members && !m.itNumber ? 'error' : ''}`}
                value={m.itNumber}
                onChange={e => updateMember(i, 'itNumber', e.target.value)}
                placeholder="IT22XXXXXX"
              />
              <input
                className={`form-control name-input ${fieldErrors.members && !m.name ? 'error' : ''}`}
                value={m.name}
                onChange={e => updateMember(i, 'name', e.target.value)}
                placeholder="Full Name"
              />
              <input
                className="form-control module-input"
                value={m.module}
                onChange={e => updateMember(i, 'module', e.target.value)}
                placeholder="Backend / Frontend / Mobile..."
              />
              {members.length > 1 && (
                <button className="btn-remove" onClick={() => removeMember(i)} title="Remove">×</button>
              )}
            </div>
          ))}

          {fieldErrors.members && <div className="form-error">⚠ {fieldErrors.members}</div>}

          {members.length < 6 && (
            <button className="btn-add" onClick={addMember}>
              + Add Member
            </button>
          )}
        </div>

        {/* ── Section 3: Project Details ── */}
        <div className="card">
          <div className="card-title">
            🚀 Project Information
            <span className="badge">Section 3</span>
          </div>

          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input
              className="form-control"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="SkillConnect"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Project Description (one sentence)</label>
            <textarea
              className="form-control"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A mobile marketplace app that connects customers with skilled workers and equipment suppliers"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Problem Being Solved</label>
            <textarea
              className="form-control"
              rows={3}
              value={problemDescription}
              onChange={e => setProblemDescription(e.target.value)}
              placeholder="Describe the main problem your app solves..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Users</label>
            <div className="chips">
              {ALL_USERS.map(u => (
                <span
                  key={u}
                  className={`chip ${targetUsers.includes(u) ? 'active' : ''}`}
                  onClick={() => toggleChip(targetUsers, setTargetUsers, u)}
                >
                  {u}
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Core Features (comma separated)</label>
            <textarea
              className="form-control"
              rows={2}
              value={coreFeatures}
              onChange={e => setCoreFeatures(e.target.value)}
              placeholder="Job posting, Booking system, Equipment rental, Reviews, Complaints"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tech Stack</label>
            <div className="chips">
              {ALL_TECH.map(t => (
                <span
                  key={t}
                  className={`chip ${techStack.includes(t) ? 'active' : ''}`}
                  onClick={() => toggleChip(techStack, setTechStack, t)}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 4: Submission Info ── */}
        <div className="card">
          <div className="card-title">
            📅 Submission Details
            <span className="badge">Section 4</span>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Module Code</label>
              <input className="form-control" value={moduleCode} onChange={e => setModuleCode(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Assignment Title</label>
              <input className="form-control" value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Submission Date</label>
            <input
              type="date"
              className="form-control"
              value={submissionDate}
              onChange={e => setSubmissionDate(e.target.value)}
            />
          </div>
        </div>

        {/* ── Generate Button ── */}
        <button id="generate-btn" className="btn-generate" onClick={handleGenerate}>
          ⚡ Generate Documents
        </button>

        {/* ── Output Section ── */}
        {generated && (
          <div id="output-section" className="output-section" style={{ marginTop: 24 }}>
            <div className="tab-bar">
              {tabs.map(t => (
                <button
                  key={t.id}
                  className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="tab-content">
              <textarea
                id={`output-${activeTab}`}
                className="output-textarea"
                readOnly
                value={activeContent.content}
              />
              <div className="action-row">
                <button
                  className={`btn-action ${copiedTab === activeTab ? 'copied' : ''}`}
                  onClick={() => handleCopy(activeContent.content, activeTab)}
                >
                  {copiedTab === activeTab ? '✓ Copied!' : '📋 Copy to Clipboard'}
                </button>
                <button
                  className="btn-action download"
                  onClick={() => handleDownload(activeContent.content, activeContent.file)}
                >
                  ⬇ Download as .txt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default SubmissionForm
