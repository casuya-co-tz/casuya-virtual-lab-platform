# Blog Feature Implementation Plan

## Overview
Add a blog system so Admin can publish website news/updates and users can read them.

---

## 1. Database — New Migration

**File:** `supabase/migrations/009_blog_posts.sql`

```sql
CREATE TABLE blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  title_sw        TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  content         TEXT NOT NULL,           -- markdown content
  excerpt         TEXT,                    -- short summary for card listings
  featured_image  TEXT,                    -- URL to cover image
  author_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  tags            TEXT[] DEFAULT '{}',
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
```

---

## 2. Admin API Routes

### `src/app/api/admin/blog/route.ts`
| Method | Action | Auth |
|--------|--------|------|
| `GET` | List all posts (paginated, searchable) | `requireAdmin()` |
| `POST` | Create new post | `requireAdmin()` |

### `src/app/api/admin/blog/[id]/route.ts`
| Method | Action | Auth |
|--------|--------|------|
| `GET` | Get single post by ID | `requireAdmin()` |
| `PUT` | Update post | `requireAdmin()` |
| `DELETE` | Delete post | `requireAdmin()` |

---

## 3. Public API Routes

### `src/app/api/blog/route.ts`
| Method | Action | Auth |
|--------|--------|------|
| `GET` | List published posts (paginated, ordered by `published_at DESC`) | none |

### `src/app/api/blog/[slug]/route.ts`
| Method | Action | Auth |
|--------|--------|------|
| `GET` | Get single published post by `slug` (404 if not published) | none |

---

## 4. Admin Pages

### `src/app/admin/blog/page.tsx` — Post List
- Table with columns: Title, Status (Published/Draft), Author, Date
- "New Post" button
- Search/filter by title or tags
- Pagination
- Click row → edit page

### `src/app/admin/blog/new/page.tsx` — Create Post
- Form fields:
  - Title (EN) + Title (SW)
  - Slug (auto-generated from title, editable)
  - Excerpt (short summary)
  - Content (textarea, markdown)
  - Tags (comma-separated input)
  - Featured Image URL
  - Published checkbox + Publish Date picker
- "Save as Draft" / "Publish" buttons

### `src/app/admin/blog/[id]/page.tsx` — Edit Post
- Same form as Create, pre-filled
- "Delete" button with confirmation modal

---

## 5. Public Pages

### `src/app/blog/page.tsx` — Blog Listing
- Hero / page title
- Grid of blog post cards
- Each card: featured image, title, excerpt, date, author, tags
- Pagination (older posts)
- Server component wrapping client `BlogList`

### `src/app/blog/[slug]/page.tsx` — Single Post
- Full post content
- Title, author, publish date, tags
- Back to blog link
- Share links (optional)

---

## 6. Components

### `src/components/blog/BlogCard.tsx`
- Card with image, title, excerpt, date, tags
- Links to `/blog/[slug]`

### `src/components/blog/BlogList.tsx`
- Client component fetching from `/api/blog`
- Grid layout, pagination, loading/empty states

### `src/components/blog/BlogPost.tsx`
- Client component fetching single post from `/api/blog/[slug]`
- Renders markdown content, metadata

---

## 7. Navigation Updates

### `src/components/layout/Navbar.tsx`
- Add `<a href="/blog">Blog</a>` in the main nav links section

### `src/components/layout/Footer.tsx`
- Add `<a href="/blog">Blog</a>` in the footer links column

### `src/components/layout/Sidebar.tsx`
- Add Blog link to `adminItems` array (for admin sidebar)

### `src/components/layout/MobileDrawer.tsx`
- No change needed — Blog will be accessible from public nav

---

## 8. Home Page Feature

### `src/app/page.tsx`
- Optionally add a "Latest from Blog" section between `Features` and `VoicesFromTanzania`
- Shows 3 most recent published posts as cards
- Links to `/blog` for full list

---

## 9. i18n Translations

Keys to add to `src/lib/i18n.ts` (both `en` and `sw`):

```
nav.blog             -> Blog / Blogu
blog.title           -> Blog / Blogu
blog.subtitle        -> Latest news and updates / Habari na sasisho
blog.create          -> New Post / Chapisha Mpya
blog.editPost        -> Edit Post / Hariri Chapisho
blog.posts           -> Posts / Machapisho
blog.readMore        -> Read More / Soma Zaidi
blog.backToBlog      -> Back to Blog / Rudi kwenye Blogu
blog.noPosts         -> No posts yet / Hakuna machapisho bado
blog.published       -> Published / Imechapishwa
blog.draft           -> Draft / Rasimu
blog.tableTitle      -> Title / Jina
blog.tableStatus     -> Status / Hali
blog.tableAuthor     -> Author / Mwandishi
blog.tableDate       -> Date / Tarehe
blog.tags            -> Tags / Lebo
blog.content         -> Content / Maudhui
blog.slug            -> URL Slug / URL
blog.featuredImage   -> Featured Image / Picha Kuu
blog.excerpt         -> Excerpt / Muhtasari
blog.homeLatest      -> Latest from Our Blog / Matangazo ya Hivi Karibuni
```

---

## 10. Audit Logging

Add `'blog_post'` to `AuditEntityType` union in `src/lib/audit-logger.ts`

---

## Implementation Order

| Step | Files | Est. |
|------|-------|------|
| 1 | Migration SQL | 15 min |
| 2 | Admin API routes (list, create, get, update, delete) | 30 min |
| 3 | Public API routes (published list, single by slug) | 20 min |
| 4 | Admin pages (list, create, edit) | 45 min |
| 5 | Public components (BlogCard, BlogList, BlogPost) | 30 min |
| 6 | Public pages (blog listing, single post) | 20 min |
| 7 | Nav/Footer navigation links | 10 min |
| 8 | i18n translations | 10 min |
| 9 | Home page "latest blog" section (optional) | 15 min |
| 10 | Audit logger update | 5 min |

**Total: ~3 hours**
