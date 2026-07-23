'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
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
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('admin.settings', lang)}</h1>
      <Card className="mb-6">
        <h3 className="text-[16px] font-bold text-text-primary mb-4">{t('admin.addSetting', lang)}</h3>
        <div className="flex gap-3 items-end">
          <Input label={t('admin.tableKey', lang)} value={newKey} onChange={e => setNewKey(e.target.value)} />
          <Input label={t('admin.tableValue', lang)} value={newValue} onChange={e => setNewValue(e.target.value)} />
          <Button variant="primary" onClick={addSetting}>{t('admin.add', lang)}</Button>
        </div>
      </Card>
      <Card>
        <Table headers={[t('admin.tableKey', lang), t('admin.tableValue', lang), t('admin.tableActions', lang)]}>
          {settings.map(s => (
            <Tr key={s.key}>
              <Td>{s.key}</Td>
              <Td>{JSON.stringify(s.value)}</Td>
              <Td><button onClick={() => removeSetting(s.key)} className="text-[12px] text-accent-red underline">{t('admin.delete', lang)}</button></Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
