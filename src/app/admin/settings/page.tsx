'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Table, Tr, Td } from '@/components/ui/Table'

interface Setting {
  key: string
  value: Record<string, unknown>
}

export default function AdminSettingsPage() {
  const { lang } = useLanguage()
  const [settings, setSettings] = useState<Setting[]>([])
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : [])
      .then(data => setSettings(Array.isArray(data) ? data : []))
      .catch(() => setSettings([]))
  }, [])

  async function addSetting() {
    if (!newKey || !newValue) return
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey, value: { value: newValue } }),
      })
      if (res.ok) {
        setSettings([...settings, { key: newKey, value: { value: newValue } }])
        setNewKey('')
        setNewValue('')
      }
    } catch {
      // Network error
    }
  }

  async function removeSetting(key: string) {
    try {
      const res = await fetch(`/api/settings?key=${key}`, { method: 'DELETE' })
      if (res.ok) {
        setSettings(settings.filter(s => s.key !== key))
      }
    } catch {
      // Network error
    }
  }

  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2">{t('admin.settings', lang)}</h1>
      <div className="bg-bg-primary border border-border p-2 mb-2">
        <h3 className="text-[14px] font-bold text-text-primary mb-2">{t('admin.addSetting', lang)}</h3>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:items-end">
          <Input label={t('admin.tableKey', lang)} value={newKey} onChange={e => setNewKey(e.target.value)} className="w-full sm:w-auto" />
          <Input label={t('admin.tableValue', lang)} value={newValue} onChange={e => setNewValue(e.target.value)} className="w-full sm:w-auto" />
          <Button variant="primary" onClick={addSetting} className="w-full sm:w-auto">{t('admin.add', lang)}</Button>
        </div>
      </div>
      <div className="bg-bg-primary border border-border p-2">
        <div className="-mx-4 sm:mx-0 overflow-x-auto">
          <div className="min-w-[500px] sm:min-w-0">
        <Table headers={[t('admin.tableKey', lang), t('admin.tableValue', lang), t('admin.tableActions', lang)]}>
          {settings.map(s => (
            <Tr key={s.key}>
              <Td className="text-[12px]">{s.key}</Td>
              <Td className="text-[12px]">{JSON.stringify(s.value)}</Td>
              <Td><button onClick={() => removeSetting(s.key)} className="text-[11px] text-accent-red underline">{t('admin.delete', lang)}</button></Td>
            </Tr>
          ))}
        </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
