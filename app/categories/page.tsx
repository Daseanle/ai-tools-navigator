import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import CategoriesGrid from '@/components/CategoriesGrid'
import LoadingSpinner from '@/components/LoadingSpinner'

export const metadata: Metadata = {
  title: 'AI Tool Categories | Browse by Category',
  description: 'Explore AI tools organized by categories. Find machine learning, NLP, computer vision, automation, and other AI tools by category.',
  keywords: 'AI categories, machine learning tools, NLP tools, computer vision, AI automation, artificial intelligence categories',
  openGraph: {
    title: 'AI Tool Categories | Browse by Category',
    description: 'Explore AI tools organized by categories. Find the perfect AI solution for your specific needs.',
    type: 'website',
    url: '/categories',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Tool Categories | Browse by Category',
    description: 'Explore AI tools organized by categories. Find the perfect AI solution for your specific needs.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/categories',
  },
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Tool Categories
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our extensive collection of AI tools organized by categories. 
              Find exactly what you need for your specific use case.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li className="text-gray-900 font-medium">Categories</li>
        </ol>
      </nav>

      {/* Categories Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <CategoriesGrid />
        </Suspense>

        {/* Featured Categories Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Popular Categories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Content Generation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Content Generation</h3>
              </div>
              <p className="text-gray-600 mb-4">
                AI-powered tools for creating text, articles, marketing copy, and creative content.
              </p>
              <Link 
                href="/tools?category=content-generation"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
              >
                Explore tools
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Image & Video */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Image & Video</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Computer vision, image generation, video editing, and visual AI applications.
              </p>
              <Link 
                href="/tools?category=image-video"
                className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center"
              >
                Explore tools
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Data Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Data Analysis</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Machine learning platforms, data processing, and business intelligence tools.
              </p>
              <Link 
                href="/tools?category=data-analysis"
                className="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
              >
                Explore tools
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="mt-16 prose prose-lg max-w-4xl mx-auto">
          <h2>Browse AI Tools by Category</h2>
          <p>
            Our AI tools directory is organized into comprehensive categories to help you 
            quickly find the right solution for your specific needs. Each category contains 
            carefully curated tools with detailed descriptions, pricing information, and user reviews.
          </p>
          
          <h3>Category Overview</h3>
          <ul>
            <li><strong>Content Generation:</strong> Writing assistants, copywriting tools, and content creators</li>
            <li><strong>Image & Video:</strong> Visual AI, image generators, and video processing tools</li>
            <li><strong>Data Analysis:</strong> Machine learning platforms and data science tools</li>
            <li><strong>Productivity:</strong> Automation tools and workflow optimizers</li>
            <li><strong>Development:</strong> AI frameworks and programming assistants</li>
            <li><strong>Business:</strong> AI solutions for enterprise and business operations</li>
          </ul>

          <h3>How to Choose the Right Category</h3>
          <p>
            Start by identifying your primary use case. Are you looking to create content, 
            analyze data, or automate processes? Each category is designed to group similar 
            tools together, making it easier to compare features and find the best fit for your project.
          </p>
        </section>
      </main>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "AI Tool Categories",
            "description": "Browse AI tools organized by categories",
            "url": `${process.env.NEXT_PUBLIC_SITE_URL}/categories`,
            "mainEntity": {
              "@type": "ItemList",
              "name": "AI Tool Categories",
              "description": "Collection of AI tool categories"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": process.env.NEXT_PUBLIC_SITE_URL
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Categories",
                  "item": `${process.env.NEXT_PUBLIC_SITE_URL}/categories`
                }
              ]
            }
          })
        }}
      />
    </div>
  )
}