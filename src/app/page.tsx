import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/home/Hero'
import { HowItWorks } from '@/components/home/HowItWorks'
import { SubjectCards } from '@/components/home/SubjectCards'
import { Features } from '@/components/home/Features'
import { Footer } from '@/components/layout/Footer'
import { UserProvider } from '@/contexts/UserContext'
import dynamic from 'next/dynamic'

const LazyVoices = dynamic(() => import('@/components/home/VoicesFromTanzania').then(m => m.VoicesFromTanzania), {
  ssr: false,
  loading: () => <div className="px-4 sm:px-6 py-10 sm:py-20 bg-bg-primary border-b border-border"><div className="max-w-7xl mx-auto h-40 bg-bg-tertiary animate-pulse" /></div>,
})

const LazyFinalCTA = dynamic(() => import('@/components/home/FinalCTA').then(m => m.FinalCTA), {
  ssr: false,
  loading: () => <div className="px-4 sm:px-6 py-10 sm:py-20 bg-bg-primary border-b border-border"><div className="max-w-7xl mx-auto h-32 bg-bg-tertiary animate-pulse" /></div>,
})

export default function HomePage() {
  return (
    <UserProvider>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <SubjectCards />
        <Features />
        <LazyVoices />
        <LazyFinalCTA />
      </main>
      <Footer />
    </UserProvider>
  )
}
