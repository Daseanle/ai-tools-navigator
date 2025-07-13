import { Metadata } from 'next'
import { Suspense } from 'react'
import ToolsGrid from '@/components/ToolsGrid'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import LoadingSpinner from '@/components/LoadingSpinner'

export const metadata: Metadata = {
  title: 'AI Tools Directory | Discover the Best AI Tools',
  description: 'Browse our comprehensive directory of AI tools. Find the perfect AI solution for your needs with detailed descriptions, ratings, and categories.',
  keywords: 'AI tools, artificial intelligence, machine learning, AI directory, AI applications, AI software',
  openGraph: {
    title: 'AI Tools Directory | Discover the Best AI Tools',
    description: 'Browse our comprehensive directory of AI tools. Find the perfect AI solution for your needs.',
    type: 'website',
    url: '/tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Tools Directory | Discover the Best AI Tools',
    description: 'Browse our comprehensive directory of AI tools. Find the perfect AI solution for your needs.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/tools',
  },
}

interface ToolsPageProps {
  searchParams: {
    category?: string
    search?: string
    sort?: string
    page?: string
  }
}

export default function ToolsPage({ searchParams }: ToolsPageProps) {
  const { category, search, sort, page } = searchParams

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Tools Directory
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover, compare, and find the perfect AI tools for your projects. 
              Our curated collection features the latest and most powerful AI applications.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full lg:w-auto">
              <Suspense fallback={<div className="h-12 bg-gray-200 rounded-lg animate-pulse" />}>
                <SearchBar defaultValue={search} />
              </Suspense>
            </div>
            <div className="w-full lg:w-auto">
              <Suspense fallback={<div className="h-12 bg-gray-200 rounded-lg animate-pulse" />}>
                <FilterBar
                  selectedCategory={category}
                  selectedSort={sort}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <ToolsGrid
            category={category}
            search={search}
            sort={sort}
            page={parseInt(page || '1')}
          />
        </Suspense>

        {/* SEO Content */}
        <section className="mt-16 prose prose-lg max-w-4xl mx-auto">
          <h2>About Our AI Tools Directory</h2>
          <p>
            Our AI tools directory is a comprehensive collection of artificial intelligence 
            applications designed to help you discover the perfect AI solution for your needs. 
            Whether you're looking for machine learning platforms, natural language processing 
            tools, computer vision applications, or automation software, we've got you covered.
          </p>
          
          <h3>Why Choose Our AI Tools?</h3>
          <ul>
            <li><strong>Curated Selection:</strong> Every tool is carefully reviewed and tested</li>
            <li><strong>Detailed Reviews:</strong> Comprehensive information about features and pricing</li>
            <li><strong>Regular Updates:</strong> Fresh content and new tools added regularly</li>
            <li><strong>User Ratings:</strong> Community-driven feedback and ratings</li>
            <li><strong>Free & Paid Options:</strong> Tools for every budget and requirement</li>
          </ul>

          <h3>Popular AI Tool Categories</h3>
          <p>
            Explore our most popular categories including content generation, image processing, 
            data analysis, chatbots, productivity tools, and development frameworks. Each category 
            is carefully organized to help you find exactly what you're looking for.
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
            "name": "AI Tools Directory",
            "description": "Comprehensive directory of AI tools and applications",
            "url": `${process.env.NEXT_PUBLIC_SITE_URL}/tools`,
            "mainEntity": {
              "@type": "ItemList",
              "name": "AI Tools",
              "description": "Collection of artificial intelligence tools and applications"
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
                  "name": "Tools",
                  "item": `${process.env.NEXT_PUBLIC_SITE_URL}/tools`
                }
              ]
            }
          })
        }}
      />
    </div>
  )
}