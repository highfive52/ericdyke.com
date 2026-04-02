import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import Header from './components/Header'
import Hero from './components/Hero'
import './App.css'

type BlogArticle = {
  slug: string
  title: string
  date: string
  tags: string[]
  summary: string
  excerpt: string
  readTime: string
  content: string
}

type MarkdownDoc = {
  meta: Record<string, string>
  body: string
}

const articleFiles = ['article1.md', 'article2.md', 'article3.md']
const BLOG_TILE_EXCERPT_WORDS = 30

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#>*_\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseFrontmatter(markdown: string) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  const body = match ? match[2].trim() : markdown.trim()

  if (!match) {
    return { meta: {}, body }
  }

  const rawMeta = match[1]
  const meta: Record<string, string> = {}

  rawMeta.split(/\r?\n/).forEach((line) => {
    const idx = line.indexOf(':')
    if (idx === -1) return
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, '')
    meta[key] = value
  })

  return { meta, body }
}

function buildWordExcerpt(text: string, maxWords: number) {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) {
    return words.join(' ')
  }
  return `${words.slice(0, maxWords).join(' ')}...`
}

async function loadMarkdownDoc(path: string): Promise<MarkdownDoc> {
  const response = await fetch(path, {
    cache: 'no-store',
  })
  const markdown = await response.text()
  const { meta, body } = parseFrontmatter(markdown)
  return { meta, body }
}

async function loadBlogArticles(): Promise<BlogArticle[]> {
  const records = await Promise.all(
    articleFiles.map(async (fileName) => {
      const response = await fetch(`/content/blog/${fileName}`)
      const markdown = await response.text()
      const { meta, body } = parseFrontmatter(markdown)
      const plain = stripMarkdown(body)
      const words = plain.split(/\s+/).filter(Boolean).length
      const minutes = Math.max(1, Math.round(words / 220))
      const slug = fileName.replace(/\.md$/, '')
      const excerpt = buildWordExcerpt(plain, BLOG_TILE_EXCERPT_WORDS)
      const rawSummary = (meta.summary || '').trim()
      const summary = rawSummary ? buildWordExcerpt(rawSummary, BLOG_TILE_EXCERPT_WORDS) : ''
      const tags = (meta.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

      return {
        slug,
        title: meta.title || slug,
        date: meta.date || '',
        tags,
        summary,
        excerpt,
        readTime: `${minutes} min read`,
        content: body,
      }
    }),
  )

  return records.sort((a, b) => b.date.localeCompare(a.date))
}

type HomePageProps = {
  articles: BlogArticle[]
}

const ARTICLES_PER_PAGE = 4

function HomePage({ articles }: HomePageProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [formMessage, setFormMessage] = useState('')
  const [lastSubmitTime, setLastSubmitTime] = useState(0)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  const SUBMIT_COOLDOWN_MS = 30_000
  const contactEmail = ['hello', 'ericdyke.com'].join('@')

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail)
      setCopyStatus('copied')
      window.setTimeout(() => setCopyStatus('idle'), 2000)
    } catch {
      setCopyStatus('error')
      window.setTimeout(() => setCopyStatus('idle'), 3000)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const subject = String(formData.get('subject') || '').trim() || 'Website contact form message'
    const honeypot = String(formData.get('_honey') || '').trim()

    // Bots often fill hidden fields; silently exit to avoid signaling detection.
    if (honeypot) {
      setFormStatus('success')
      setFormMessage('Thanks! Your message was sent successfully.')
      form.reset()
      return
    }

    const now = Date.now()
    if (now - lastSubmitTime < SUBMIT_COOLDOWN_MS) {
      const secondsLeft = Math.ceil((SUBMIT_COOLDOWN_MS - (now - lastSubmitTime)) / 1000)
      setFormStatus('error')
      setFormMessage(`Please wait ${secondsLeft} seconds before sending another message.`)
      return
    }

    formData.set('_subject', subject)
    formData.set('_captcha', 'false')
    formData.set('_template', 'box')

    setFormStatus('sending')
    setFormMessage('Sending message...')

    try {
      await fetch('https://formsubmit.co/hello@ericdyke.com', {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      })

      setFormStatus('success')
      setFormMessage('Thanks! Your message was sent successfully.')
      setLastSubmitTime(now)
      form.reset()
    } catch {
      setFormStatus('error')
      setFormMessage('Sorry, we could not send your message. Please try again in a moment.')
    }
  }

  const totalPages = Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE))

  useEffect(() => {
    setCurrentPage(1)
  }, [articles.length])

  const pageArticles = useMemo(() => {
    const page = Math.min(currentPage, totalPages)
    const start = (page - 1) * ARTICLES_PER_PAGE
    return articles.slice(start, start + ARTICLES_PER_PAGE)
  }, [articles, currentPage, totalPages])

  const changePage = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(nextPage)
    requestAnimationFrame(() => {
      const blogSection = document.getElementById('blog')
      if (blogSection) {
        blogSection.scrollIntoView({ behavior: 'auto', block: 'start' })
      }
    })
  }

  return (
    <main>
      <Hero />

      <section id="blog" className="section section--blog" aria-label="Articles and insights">
        <div className="section__inner">
          <p className="section__eyebrow">Blog</p>
          <h2 className="section__title">Articles &amp; Insights</h2>
          <p className="section__intro">
            Thoughts on data engineering, modeling, and building scalable systems that turn
            data into reliable decision-making tools.
          </p>

          <div className="articles-grid">
            {pageArticles.map((article) => (
              <article className="article-card" key={article.slug}>
                <p className="article-card__meta">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </p>
                <h3>{article.title}</h3>
                <p>{article.summary || article.excerpt}</p>
                <ul className="article-card__tags" aria-label="Article tags">
                  {article.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <Link to={`/blog/${article.slug}`} className="article-card__readmore">
                  Read more
                </Link>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="blog-pagination" aria-label="Blog pagination">
              <button
                type="button"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1
                return (
                  <button
                    type="button"
                    key={page}
                    className={currentPage === page ? 'is-active' : ''}
                    onClick={() => changePage(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
              })}

              <button
                type="button"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </section>

      <section id="about" className="section section--about" aria-label="About Eric Dyke">
        <div className="section__inner about-layout">
          <div className="about-copy">
            <p className="section__eyebrow">About Me</p>
            <h2 className="section__title">Turning Data Into Reliable, Actionable Systems</h2>
            <p className="section__body">
              I&apos;m Eric Dyke, a Senior Data Engineer based in Boston with a passion for building
              scalable data platforms that transform complex, fragmented data into clear,
              reliable insights.
            </p>
            <br></br>
            <p className="section__body">
              With over five years of experience across data engineering, analytics, and business
              intelligence, I&apos;ve partnered with both enterprise organizations and fast-moving
              teams to design data warehouses, develop pipeline architectures, and build semantic
              layers that enable self-service analytics. My work focuses on bridging the gap
              between raw data and decision-making, ensuring data is not only accessible, but also
              well-modeled, trustworthy, and aligned with business needs.
            </p>
            <br></br>
            <p className="section__body">
              Outside of building data systems, I enjoy working on side projects like analytics
              APIs and exploring new approaches in data architecture and cloud platforms. When
              I&apos;m away from the keyboard, you&apos;ll usually find me running along the Charles River
              or cycling on the South Shore.
            </p>
            <div className="about-cta-row" aria-label="Profile links">
              <Link to="/resume" className="about-cta-link">
                View Resume
              </Link>
              <Link to="/education" className="about-cta-link about-cta-link--secondary">
                Education &amp; Certifications
              </Link>
            </div>
          </div>

          <div className="about-aside">
            <img src="/images/about_profile.jpg" alt="Eric Dyke portrait" loading="lazy" />
          </div>
        </div>
      </section>

      <section id="contact" className="section section--contact" aria-label="Contact form and info">
        <div className="section__inner contact-layout">
          <div>
            <p className="section__eyebrow">Get In Touch</p>
            <h2 className="section__title">Let&apos;s Create Something Amazing</h2>
            <p className="section__intro">
              Have a job opportunity or project in mind? I&apos;d love to hear about it. Drop me a
              message and let&apos;s explore how we can work together.
            </p>

            <div className="contact-info">
              <div className="contact-info__item">
                <span className="contact-info__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M3 6h18v12H3z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path
                      d="M3 7.5 12 14l9-6.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="contact-info__content">
                  <h3>Email</h3>
                  <div className="contact-email-row">
                    <img
                      src="/images/email-obfuscated.svg"
                      alt="Email address shown in obfuscated format"
                      className="contact-email-image"
                      loading="lazy"
                    />
                    <button type="button" className="contact-email-copy" onClick={handleCopyEmail}>
                      Copy email
                    </button>
                  </div>
                  {copyStatus === 'copied' && <p className="contact-email-status">Copied to clipboard.</p>}
                  {copyStatus === 'error' && (
                    <p className="contact-email-status contact-email-status--error">
                      Could not copy automatically. Please copy manually.
                    </p>
                  )}
                </div>
              </div>
              <div className="contact-info__item">
                <span className="contact-info__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path
                      d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="11" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <div className="contact-info__content">
                  <h3>Location</h3>
                  <p>Boston, MA</p>
                </div>
              </div>
              <div>
                <h3>Follow Me</h3>
                <div className="contact-social" aria-label="Social profiles">
                  <a
                    href="https://www.linkedin.com/in/ericdyke/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                  >
                    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                      <path
                        d="M6.3 8.7H3.8V20h2.5V8.7Zm.2-3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM20.2 13.6V20h-2.5v-6.1c0-1.6-.6-2.6-2-2.6-1.1 0-1.7.7-2 1.4-.1.2-.1.6-.1.9V20h-2.5s0-10.2 0-11.3h2.5V10c.3-.6 1-1.5 2.6-1.5 1.9 0 4 1.2 4 5.1Z"
                        fill="currentColor"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://github.com/highfive52"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                  >
                    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                      <path
                        d="M12 2.5a9.5 9.5 0 0 0-3 18.5c.5.1.7-.2.7-.5v-1.9c-2.9.6-3.5-1.2-3.5-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.5 2.5 1.1 3.1.8.1-.6.4-1.1.7-1.4-2.3-.3-4.7-1.1-4.7-5A3.9 3.9 0 0 1 7 7.4c-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.8 1a9.7 9.7 0 0 1 5.1 0c2-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7.7.8 1.1 1.9 1.1 3.2 0 3.9-2.4 4.7-4.7 5 .4.3.8 1 .8 2.1v3.1c0 .3.2.6.7.5A9.5 9.5 0 0 0 12 2.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleContactSubmit}>
            <input
              type="text"
              name="_honey"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="contact-form__honeypot"
            />
            <label>
              Your Name *
              <input type="text" name="name" required />
            </label>
            <label>
              Email Address *
              <input type="email" name="email" required />
            </label>
            <label>
              Subject
              <input type="text" name="subject" />
            </label>
            <label>
              Message *
              <textarea name="message" rows={5} required />
            </label>
            <button type="submit" disabled={formStatus === 'sending'}>
              {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
            {formStatus !== 'idle' && (
              <p
                className={`contact-form__status ${
                  formStatus === 'success' ? 'contact-form__status--success' : ''
                } ${formStatus === 'error' ? 'contact-form__status--error' : ''}`}
              >
                {formMessage}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  )
}

type BlogArticlePageProps = {
  articles: BlogArticle[]
}

function BlogArticlePage({ articles }: BlogArticlePageProps) {
  const { slug } = useParams()
  const article = articles.find((item) => item.slug === slug)

  if (!article) {
    return (
      <main className="article-page">
        <div className="article-page__inner">
          <p className="article-page__back">
            <Link to="/">Back to blog</Link>
          </p>
          <h1>Article not found</h1>
        </div>
      </main>
    )
  }

  return (
    <main className="article-page">
      <article className="article-page__inner">
        <p className="article-page__back">
          <Link to="/#blog">
            <span className="article-page__back-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path
                  d="M14.5 5.5 8 12l6.5 6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Back to Blog
          </Link>
        </p>
        <p className="article-page__meta">
          <span>{article.date}</span>
          <span>{article.readTime}</span>
        </p>
        <h1>{article.title}</h1>
        <ul className="article-page__tags">
          {article.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="article-page__content">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {article.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  )
}

function ResumePage() {
  const [doc, setDoc] = useState<MarkdownDoc | null>(null)

  useEffect(() => {
    loadMarkdownDoc('/content/resume/resume.md')
      .then(setDoc)
      .catch(() => setDoc({ meta: {}, body: 'Unable to load resume content right now.' }))
  }, [])

  return (
    <main className="credential-page" aria-label="Resume page">
      <section className="credential-page__inner">
        <p className="article-page__back">
          <Link to="/#about">
            <span className="article-page__back-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path
                  d="M14.5 5.5 8 12l6.5 6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Back to About
          </Link>
        </p>
        <p className="section__eyebrow">Resume</p>
        {doc?.meta.title && <h1 className="section__title">{doc.meta.title}</h1>}
        <div className="credential-page__content">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
            {doc?.body || 'Loading resume content...'}
          </ReactMarkdown>
        </div>
      </section>
    </main>
  )
}

function EducationPage() {
  const [doc, setDoc] = useState<MarkdownDoc | null>(null)

  useEffect(() => {
    loadMarkdownDoc('/content/resume/education.md')
      .then(setDoc)
      .catch(() => setDoc({ meta: {}, body: 'Unable to load education content right now.' }))
  }, [])

  return (
    <main className="credential-page" aria-label="Education and certifications page">
      <section className="credential-page__inner">
        <p className="article-page__back">
          <Link to="/#about">
            <span className="article-page__back-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path
                  d="M14.5 5.5 8 12l6.5 6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Back to About
          </Link>
        </p>
        <p className="section__eyebrow">Education</p>
        {doc?.meta.title && <h1 className="section__title">{doc.meta.title}</h1>}
        <div className="credential-page__content">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
            {doc?.body || 'Loading education content...'}
          </ReactMarkdown>
        </div>
      </section>
    </main>
  )
}

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      requestAnimationFrame(() => {
        const target = document.getElementById(id)
        if (target) {
          target.scrollIntoView({ behavior: 'auto', block: 'start' })
        }
      })
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.hash])

  return null
}

function App() {
  const [articles, setArticles] = useState<BlogArticle[]>([])

  useEffect(() => {
    loadBlogArticles().then(setArticles).catch(() => setArticles([]))
  }, [])

  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage articles={articles} />} />
        <Route path="/blog/:slug" element={<BlogArticlePage articles={articles} />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/education" element={<EducationPage />} />
      </Routes>

      <footer className="site-footer" aria-label="Site footer">
        <div className="site-footer__inner">
          <div className="site-footer__left">
            <p className="site-footer__name">Eric Dyke</p>
            <p>Senior Data Engineer</p>
          </div>
          <nav className="site-footer__nav" aria-label="Footer navigation">
            <Link to="/#blog">Blog</Link>
            <Link to="/#about">About</Link>
            <Link to="/resume">Resume</Link>
            <Link to="/education">Education</Link>
            <Link to="/#contact">Contact</Link>
          </nav>
          <small className="site-footer__copyright">© 2026 Eric Dyke. All rights reserved.</small>
        </div>
      </footer>
    </>
  )
}

export default App
