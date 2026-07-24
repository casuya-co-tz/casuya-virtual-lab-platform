'use client'
import React, { useState } from 'react'

interface AdminPlan {
  id: string
  slug: string
  name: string
  name_sw: string
  price: number
  user_type: 'standard' | 'developer'
  is_active: boolean
}

export const PricingManager: React.FC<{ initialPlans: AdminPlan[] }> = ({ initialPlans }) => {
  const [plans, setPlans] = useState<AdminPlan[]>(initialPlans)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<AdminPlan>>({})
  const [saving, setSaving] = useState(false)

  const startEdit = (plan: AdminPlan) => {
    setEditingId(plan.id)
    setFormData(plan)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({})
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/pricing/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...formData }),
      })
      if (!res.ok) throw new Error('Save failed')
      setPlans(plans.map(p => p.id === id ? { ...p, ...formData } as AdminPlan : p))
      setEditingId(null)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 bg-bg-primary border border-border-default rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-text-primary">Pricing Plans</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary">
          <thead className="bg-bg-tertiary text-text-primary uppercase text-xs tracking-wider">
            <tr>
              <th className="p-3">Slug</th>
              <th className="p-3">English Name</th>
              <th className="p-3">Swahili Name</th>
              <th className="p-3">Amount (TZS)</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {plans.map((p) => (
              <tr key={p.id} className="hover:bg-bg-tertiary/50">
                <td className="p-3 font-mono text-xs">{p.slug}</td>
                <td className="p-3">
                  {editingId === p.id ? (
                    <input
                      type="text"
                      className="border border-border-default px-2 py-1 rounded bg-bg-primary text-text-primary"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : p.name}
                </td>
                <td className="p-3">
                  {editingId === p.id ? (
                    <input
                      type="text"
                      className="border border-border-default px-2 py-1 rounded bg-bg-primary text-text-primary"
                      value={formData.name_sw || ''}
                      onChange={e => setFormData({ ...formData, name_sw: e.target.value })}
                    />
                  ) : p.name_sw}
                </td>
                <td className="p-3 font-medium text-text-primary">
                  {editingId === p.id ? (
                    <input
                      type="number"
                      className="border border-border-default px-2 py-1 rounded bg-bg-primary text-text-primary w-24"
                      value={formData.price || 0}
                      onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    />
                  ) : p.price.toLocaleString()}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    p.user_type === 'developer' ? 'bg-blue-500/10 text-blue-500' : 'bg-accent-green/10 text-accent-green'
                  }`}>
                    {p.user_type}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    p.is_active ? 'bg-accent-green/10 text-accent-green' : 'bg-text-muted/10 text-text-muted'
                  }`}>
                    {p.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  {editingId === p.id ? (
                    <>
                      <button
                        onClick={() => handleSave(p.id)}
                        disabled={saving}
                        className="text-accent-green font-semibold text-xs hover:underline"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={cancelEdit} className="text-text-muted font-semibold text-xs hover:underline">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(p)} className="text-primary font-semibold text-xs hover:underline">
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
