import { NextRequest, NextResponse } from 'next/server'
import { CSRFProtection } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    // 生成新的CSRF token
    const csrfToken = CSRFProtection.generateToken()
    
    return NextResponse.json({ 
      csrfToken 
    }, {
      headers: {
        'X-CSRF-Token': csrfToken
      }
    })
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json(
      { error: '无法生成CSRF token' },
      { status: 500 }
    )
  }
}