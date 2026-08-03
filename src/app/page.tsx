import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/home/Hero'
import { HowItWorks } from '@/components/home/HowItWorks'
import { SubjectCards } from '@/components/home/SubjectCards'
import { Features } from '@/components/home/Features'
import { Footer } from '@/components/layout/Footer'
import { UserProvider } from '@/contexts/UserContext'
import DynamicHomeSections from '@/components/home/DynamicHomeSections'

export default function HomePage() {
  return (
    <UserProvider>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <SubjectCards />
        <Features />
        <DynamicHomeSections />
      </main>
      <Footer />
    </UserProvider>
  )
}
