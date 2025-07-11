import Link from 'next/link'

export default function DatabaseNotConfigured() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c0 2.21 1.79 4 4 4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Navigator Pro</h1>
            <p className="text-gray-300">数据库配置需要完成</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  需要配置环境变量
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>网站已成功部署，但需要配置数据库连接才能正常运行。</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-left space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">配置步骤：</h3>
            
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <p className="font-medium text-white">访问 Vercel Dashboard</p>
                  <p>登录 <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">vercel.com</a></p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <p className="font-medium text-white">进入项目设置</p>
                  <p>选择您的项目 → Settings → Environment Variables</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <p className="font-medium text-white">添加以下环境变量：</p>
                  <div className="mt-2 bg-gray-900 rounded-lg p-3 font-mono text-xs">
                    <div className="space-y-1">
                      <div><span className="text-green-400">NEXT_PUBLIC_SUPABASE_URL</span>=your_supabase_url</div>
                      <div><span className="text-green-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>=your_supabase_anon_key</div>
                      <div><span className="text-green-400">SUPABASE_SERVICE_ROLE_KEY</span>=your_service_role_key</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <div>
                  <p className="font-medium text-white">重新部署</p>
                  <p>保存环境变量后，Vercel会自动重新部署网站</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <p className="text-sm text-gray-400 mb-4">
              如需帮助设置 Supabase，请查看 
              <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline ml-1">
                官方文档
              </a>
            </p>
            
            <div className="flex space-x-4 justify-center">
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                创建 Supabase 项目
              </a>
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                配置 Vercel 环境变量
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}