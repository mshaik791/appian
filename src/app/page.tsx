import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
            SOWK-SIM
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A production-ready Next.js 14 application with TypeScript, Tailwind CSS, 
            shadcn/ui, Prisma, NextAuth, Redis, and comprehensive testing setup.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="px-8 py-3">
            Click Me
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-3">
            Learn More
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Next.js 14</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Latest Next.js with App Router and TypeScript support
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">shadcn/ui</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Beautiful, accessible components built with Radix UI
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Full Stack</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Prisma, NextAuth, Redis, and comprehensive testing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
