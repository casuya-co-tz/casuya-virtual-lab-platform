'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'

export default function TeacherDashboard() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/teacher/dashboard')
      .then(async r => {
        if (r.status === 401 || r.status === 403) {
          router.push('/auth')
          throw new Error('Unauthorized')
        }
        if (!r.ok) {
          const text = await r.text()
          throw new Error(`API Error: ${r.status} ${text}`)
        }
        return r.json()
      })
      .then(res => {
        setData(res)
        setLoading(false)
      })
      .catch(e => {
        console.error(e)
        setData({ error: true })
        setLoading(false)
      })
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse text-text-secondary font-mono tracking-widest">{t('common.loading', lang).toUpperCase()} PORTAL...</div>
      </div>
    )
  }

  if (data?.error) {
    return (
      <div className="p-3 text-center bg-bg-secondary border border-border-strong">
        <h2 className="text-accent-red font-bold text-[14px] mb-1">{t('error.title', lang)}</h2>
        <p className="text-text-secondary text-[12px]">{t('error.unexpected', lang)}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[clamp(24px,4vw,32px)] font-extrabold text-text-primary tracking-tight">{t('teacher.portalTitle', lang)}</h1>
        <p className="text-[12px] text-text-secondary mt-1">{t('teacher.manage', lang)}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <div className="p-2 bg-bg-secondary border-border-strong border">
          <div className="text-[10px] uppercase text-text-secondary font-bold tracking-wider mb-1">{t('teacher.totalStudents', lang)}</div>
          <div className="text-[24px] sm:text-[32px] font-black text-accent-blue leading-none">{data.stats.totalStudents}</div>
        </div>
        <div className="p-2 bg-bg-secondary border-border-strong border">
          <div className="text-[10px] uppercase text-text-secondary font-bold tracking-wider mb-1">{t('teacher.completedLabs', lang)}</div>
          <div className="text-[24px] sm:text-[32px] font-black text-accent-purple leading-none">{data.stats.completedLabs}</div>
        </div>
        <div className="p-2 bg-bg-secondary border-border-strong border">
          <div className="text-[10px] uppercase text-text-secondary font-bold tracking-wider mb-1">{t('teacher.classAverage', lang)}</div>
          <div className="text-[24px] sm:text-[32px] font-black text-accent-green leading-none">{data.stats.averageScore}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 space-y-2 min-w-0">
          <h2 className="text-[13px] sm:text-[14px] font-bold text-text-primary">{t('teacher.recentLabActivity', lang)}</h2>
          <div className="bg-bg-primary border border-border-strong overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[500px] sm:min-w-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-secondary border-b border-border-strong">
                    <th className="p-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider">{t('teacher.studentHeader', lang)}</th>
                    <th className="p-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider">{t('teacher.labHeader', lang)}</th>
                    <th className="p-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider">{t('teacher.statusHeader', lang)}</th>
                    <th className="p-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider">{t('teacher.scoreHeader', lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-[12px] text-text-secondary">
                        {t('teacher.noRecentActivity', lang)}
                      </td>
                    </tr>
                  ) : (
                    data.recentActivity.map((activity: any) => (
                      <tr key={activity.id} className="border-b border-border last:border-0 hover:bg-bg-secondary/50 transition-colors">
                        <td className="p-2 text-[12px] font-bold text-text-primary">{activity.profiles?.full_name}</td>
                        <td className="p-2 text-[12px] text-text-secondary">{activity.labs?.title}</td>
                        <td className="p-2 text-[12px]">
                          <span className={`px-2 py-1 text-[9px] uppercase font-bold tracking-wider ${
                            activity.status === 'completed' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-amber/10 text-accent-amber'
                          }`}>
                            {activity.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-2 text-[12px] font-bold text-text-primary">{activity.score || 0}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Student Roster */}
        <div className="space-y-2">
          <h2 className="text-[13px] sm:text-[14px] font-bold text-text-primary">{t('teacher.classRoster', lang)}</h2>
          <div className="bg-bg-primary border border-border-strong max-h-[400px] overflow-y-auto">
            {data.students.length === 0 ? (
              <div className="p-3 text-[12px] text-text-secondary text-center">
                {t('teacher.noStudents', lang)}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {data.students.map((student: any) => (
                  <li key={student.id} className="p-2 flex items-center justify-between hover:bg-bg-secondary/50">
                    <span className="text-[12px] font-bold text-text-primary">{student.full_name}</span>
                    <Button variant="ghost" className="!h-8 !px-3 !text-[12px]">View</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button variant="primary" className="w-full mt-4 !h-12" onClick={() => {
            if (!data?.teacherSchoolId) {
              alert("No school associated with this account. Only new teachers have automatic schools. Please contact support.")
              return
            }
            const inviteUrl = `${window.location.origin}/auth?role=student&school_id=${data.teacherSchoolId}`
            navigator.clipboard.writeText(inviteUrl)
            alert("Invite link copied to clipboard!\n\nSend this to your students: " + inviteUrl)
          }}>
            {t('button.copyInvite', lang)}
          </Button>
        </div>
      </div>
    </div>
  )
}
