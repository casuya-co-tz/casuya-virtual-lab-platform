import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/home/Hero'
import { HowItWorks } from '@/components/home/HowItWorks'
import { SubjectCards } from '@/components/home/SubjectCards'
import { Features } from '@/components/home/Features'
import { VoicesFromTanzania } from '@/components/home/VoicesFromTanzania'
import { FinalCTA } from '@/components/home/FinalCTA'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <SubjectCards />
        <Features />
        <VoicesFromTanzania />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
