import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/home/Hero'
import { SubjectCards } from '@/components/home/SubjectCards'
import { Features } from '@/components/home/Features'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SubjectCards />
        <Features />
      </main>
      <Footer />
    </>
  )
}
