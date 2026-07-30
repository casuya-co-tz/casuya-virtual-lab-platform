import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { UserProvider } from '@/contexts/UserContext'
import { BlogList } from '@/components/blog/BlogList'

export default function BlogPage() {
  return (
    <UserProvider>
      <Navbar />
      <main className="min-h-screen bg-bg-secondary px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-[clamp(28px,6vw,42px)] font-extrabold text-text-primary text-center mb-2">Blog</h1>
          <p className="text-[14px] text-text-secondary text-center mb-8 max-w-xl mx-auto">Latest news, updates, and advancements from the Casuya team</p>
          <BlogList />
        </div>
      </main>
      <Footer />
    </UserProvider>
  )
}
