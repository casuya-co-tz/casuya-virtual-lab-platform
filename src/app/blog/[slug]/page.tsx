import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { UserProvider } from '@/contexts/UserContext'
import { BlogPost } from '@/components/blog/BlogPost'

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  return (
    <UserProvider>
      <Navbar />
      <main className="min-h-screen bg-bg-secondary px-4 sm:px-6 py-8 sm:py-12">
        <BlogPost slug={params.slug} />
      </main>
      <Footer />
    </UserProvider>
  )
}
