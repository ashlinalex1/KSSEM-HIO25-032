import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from the Python Flask backend
    const response = await fetch('http://localhost:5000/api/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      
      // Transform the data to match expected format
      const activityData: { [key: string]: number } = {}
      
      if (data.today) {
        activityData.study = data.today.study_minutes || 0
        activityData.entertainment = data.today.entertainment_minutes || 0
        activityData.others = data.today.others_minutes || 0
        activityData.work = data.today.work_minutes || 0
        activityData.social = data.today.social_minutes || 0
        activityData.productivity = data.today.productivity_minutes || 0
        activityData.gaming = data.today.gaming_minutes || 0
      }

      return NextResponse.json({
        success: true,
        data: activityData,
        timestamp: new Date().toISOString(),
        backend_connected: true
      })
    } else {
      throw new Error('Backend not available')
    }
  } catch (error) {
    // Return mock data when backend is not available
    console.log('Backend not available, returning mock data')
    
    return NextResponse.json({
      success: true,
      data: {
        study: 45.5,
        entertainment: 23.2,
        others: 15.8,
        work: 12.3,
        social: 8.7
      },
      timestamp: new Date().toISOString(),
      backend_connected: false
    })
  }
}
