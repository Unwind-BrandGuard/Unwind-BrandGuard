
import { useEffect, useState } from 'react'
import {
  BookOpen,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Archive,
  RotateCcw,
  ChevronDown,
  Save,
  X
} from 'lucide-react'
import { supabase } from '../supabase'

const categories = [
  { value: 'voice_tone', label: 'Voice and tone' },
  { value: 'terminology', label: 'Approved terminology' },
  { value: 'approved_fact', label: 'Approved facts' },
  { value: 'prohibited_claim', label: 'Prohibited claims' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'visual_identity', label: 'Visual identity' },
  { value: 'other', label: 'Other' },
]

export default function GuidelinesPage({ workspace, role }) {
  const [guidelines, setGuidelines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [search, setSearch] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const canManage = ['owner', 'admin', 'editor'].includes(role)

  const [form, setForm] = useState({
    title: '',
    category: 'voice_tone',
    content: '',
    source_reference: '',
  })

  async function loadGuidelines() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('brand_guidelines')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setGuidelines(data || [])

    setLoading(false)
  }

  useEffect(() => {
    loadGuidelines()
  }, [workspace.id])

  function openCreate() {
    setEditing(null)
    setForm({
      title: '',
      category: 'voice_tone',
      content: '',
      source_reference: ''
    })
    setError('')
    setNotice('')
    setEditorOpen(true)
  }

  function openEdit(guideline) {
    setEditing(guideline)
    setForm({
      title: guideline.title,
      category: guideline.category,
      content: guideline.content,
      source_reference: guideline.source_reference || '',
    })
    setError('')
    setNotice('')
    setEditorOpen(true)
  }

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    const values = {
      title: form.title.trim(),
      category: form.category,
      content: form.content.trim(),
      source_reference: form.source_reference.trim() || null,
    }

    try {
      if (editing) {
        const { error } = await supabase
          .from('brand_guidelines')
          .update(values)
          .eq('id', editing.id)
          .eq('workspace_id', workspace.id)

        if (error) throw error
        setNotice('Guideline updated successfully.')
      } else {
        const { data: userData, error: userError } =
          await supabase.auth.getUser()

        if (userError) throw userError
        if (!userData.user) throw new Error('Please sign in again.')

        const { error } = await supabase
          .from('brand_guidelines')
          .insert({
            ...values,
            workspace_id: workspace.id,
            created_by: userData.user.id,
          })

        if (error) throw error
        setNotice('Guideline created successfully.')
      }

      setEditorOpen(false)
      await loadGuidelines()
    } catch (err) {
      setError(err.message || 'Could not save this guideline.')
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(guideline, status) {
    setError('')
    setNotice('')

    const { error } = await supabase
      .from('brand_guidelines')
      .update({ status })
      .eq('id', guideline.id)
      .eq('workspace_id', workspace.id)

    if (error) {
      setError(error.message)
      return
    }

    setNotice(
      status === 'archived'
        ? 'Guideline archived.'
        : 'Guideline restored.'
    )

    await loadGuidelines()
  }

  const visibleGuidelines = guidelines.filter(item => {
    const matchesStatus = showArchived
      ? item.status === 'archived'
      : item.status === 'active'

    const term = search.toLowerCase()
    const matchesSearch = !term ||
      item.title.toLowerCase().includes(term) ||
      item.content.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)

    return matchesStatus && matchesSearch
  })

  return (
    <>
      <div className="page-heading guidelines-heading">
        <div>
          <div className="eyebrow">BRAND KNOWLEDGE</div>
          <h1>Brand Guidelines</h1>
          <p>Define the standards every piece of brand content should follow.</p>
        </div>

        {canManage && (
          <button className="primary-button" onClick={openCreate}>
            <Plus size={17} /> Add guideline
          </button>
        )}
      </div>

      <div className="guideline-toolbar">
        <div className="guideline-search">
          <Search size={17} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guidelines..."
          />
        </div>

        <div className="guideline-tabs">
          <button
            className={!showArchived ? 'active' : ''}
            onClick={() => setShowArchived(false)}
          >
            Active
          </button>
          <button
            className={showArchived ? 'active' : ''}
            onClick={() => setShowArchived(true)}
          >
            Archived
          </button>
        </div>
      </div>

      {error && (
        <div className="inline-error">
          <AlertTriangle size={16} />{error}
        </div>
      )}

      {notice && (
        <div className="inline-success">
          <CheckCircle2 size={16} />{notice}
        </div>
      )}

      {loading ? (
        <div className="content-panel loading-panel">
          Loading brand guidelines...
        </div>
      ) : visibleGuidelines.length === 0 ? (
        <section className="content-panel empty-guidelines">
          <div className="placeholder-icon">
            <BookOpen size={27} />
          </div>

          <h2>
            {search
              ? 'No matching guidelines'
              : showArchived
                ? 'No archived guidelines'
                : 'Your brand knowledge starts here.'}
          </h2>

          <p>
            {search
              ? 'Try a different search term.'
              : showArchived
                ? 'Guidelines you archive will appear here.'
                : 'Add your first brand rule, approved fact, terminology preference or prohibited claim.'}
          </p>

          {!showArchived && !search && canManage && (
            <button className="primary-button" onClick={openCreate}>
              <Plus size={17} /> Create first guideline
            </button>
          )}
        </section>
      ) : (
        <section className="guideline-list">
          {visibleGuidelines.map(guideline => (
            <article
              className="content-panel guideline-card"
              key={guideline.id}
            >
              <div className="guideline-card-top">
                <span className="category-label">
                  {categories.find(
                    item => item.value === guideline.category
                  )?.label || 'Other'}
                </span>

                <span className={`guideline-status ${guideline.status}`}>
                  {guideline.status}
                </span>
              </div>

              <h2>{guideline.title}</h2>
              <p className="guideline-content">{guideline.content}</p>

              {guideline.source_reference && (
                <div className="guideline-source">
                  <span>Source:</span> {guideline.source_reference}
                </div>
              )}

              <div className="guideline-card-bottom">
                <span>
                  Updated {new Date(guideline.updated_at).toLocaleDateString()}
                </span>

                {canManage && (
                  <div className="guideline-actions">
                    {!showArchived && (
                      <button onClick={() => openEdit(guideline)}>
                        <Pencil size={14} /> Edit
                      </button>
                    )}

                    <button
                      onClick={() => changeStatus(
                        guideline,
                        showArchived ? 'active' : 'archived'
                      )}
                    >
                      {showArchived
                        ? <RotateCcw size={14} />
                        : <Archive size={14} />}

                      {showArchived ? 'Restore' : 'Archive'}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {editorOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget && !saving) {
              setEditorOpen(false)
            }
          }}
        >
          <section className="guideline-modal">
            <div className="modal-heading">
              <div>
                <div className="eyebrow">
                  {editing
                    ? 'UPDATE BRAND KNOWLEDGE'
                    : 'ADD BRAND KNOWLEDGE'}
                </div>
                <h2>
                  {editing ? 'Edit guideline' : 'Create a guideline'}
                </h2>
              </div>

              <button
                className="icon-button"
                onClick={() => setEditorOpen(false)}
                disabled={saving}
              >
                <X size={19} />
              </button>
            </div>

            <form className="guideline-form" onSubmit={handleSave}>
              <label>Guideline title</label>
              <input
                value={form.title}
                onChange={e => setForm({
                  ...form,
                  title: e.target.value
                })}
                placeholder="e.g. Use a reassuring and supportive tone"
                maxLength={120}
                required
              />

              <label>Category</label>
              <div className="select-wrap">
                <select
                  value={form.category}
                  onChange={e => setForm({
                    ...form,
                    category: e.target.value
                  })}
                >
                  {categories.map(category => (
                    <option
                      value={category.value}
                      key={category.value}
                    >
                      {category.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} />
              </div>

              <label>Guideline details</label>
              <textarea
                value={form.content}
                onChange={e => setForm({
                  ...form,
                  content: e.target.value
                })}
                placeholder="Describe the rule clearly. Include examples or conditions where useful."
                rows={5}
                maxLength={5000}
                required
              />

              <label>
                Source reference <span>(optional)</span>
              </label>
              <input
                value={form.source_reference}
                onChange={e => setForm({
                  ...form,
                  source_reference: e.target.value
                })}
                placeholder="e.g. Brand handbook, page 4 or https://..."
                maxLength={500}
              />

              {error && <div className="auth-error">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditorOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving
                    ? 'Saving...'
                    : editing
                      ? 'Save changes'
                      : 'Save guideline'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  )
}
