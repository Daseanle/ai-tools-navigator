import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 投票（点赞/踩）
export async function POST(request: NextRequest) {
  try {
    const { userId, targetId, targetType, voteType } = await request.json()

    if (!userId || !targetId || !targetType || !voteType) {
      return NextResponse.json({ 
        error: 'User ID, target ID, target type, and vote type are required' 
      }, { status: 400 })
    }

    const validTargetTypes = ['post', 'comment']
    const validVoteTypes = ['upvote', 'downvote']

    if (!validTargetTypes.includes(targetType)) {
      return NextResponse.json({ error: 'Invalid target type' }, { status: 400 })
    }

    if (!validVoteTypes.includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }

    // 检查是否已经投过票
    const { data: existingVote } = await supabase
      .from('community_votes')
      .select('id, vote_type')
      .eq('user_id', userId)
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .single()

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // 取消投票
        const { error } = await supabase
          .from('community_votes')
          .delete()
          .eq('id', existingVote.id)

        if (error) {
          console.error('Error removing vote:', error)
          return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 })
        }

        // 更新目标的投票数
        await updateVoteCounts(targetId, targetType, voteType, -1)

        return NextResponse.json({
          success: true,
          action: 'removed',
          message: 'Vote removed successfully'
        })
      } else {
        // 更改投票类型
        const { error } = await supabase
          .from('community_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id)

        if (error) {
          console.error('Error updating vote:', error)
          return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 })
        }

        // 更新目标的投票数（减去原来的，加上新的）
        await updateVoteCounts(targetId, targetType, existingVote.vote_type, -1)
        await updateVoteCounts(targetId, targetType, voteType, 1)

        return NextResponse.json({
          success: true,
          action: 'updated',
          message: 'Vote updated successfully'
        })
      }
    } else {
      // 新增投票
      const { data, error } = await supabase
        .from('community_votes')
        .insert({
          user_id: userId,
          target_id: targetId,
          target_type: targetType,
          vote_type: voteType
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating vote:', error)
        return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 })
      }

      // 更新目标的投票数
      await updateVoteCounts(targetId, targetType, voteType, 1)

      return NextResponse.json({
        success: true,
        data: data,
        action: 'created',
        message: 'Vote created successfully'
      })
    }

  } catch (error) {
    console.error('Error in vote API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 获取用户的投票状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const targetId = searchParams.get('targetId')
    const targetType = searchParams.get('targetType')

    if (!userId || !targetId || !targetType) {
      return NextResponse.json({ 
        error: 'User ID, target ID, and target type are required' 
      }, { status: 400 })
    }

    const { data: vote, error } = await supabase
      .from('community_votes')
      .select('vote_type')
      .eq('user_id', userId)
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching vote:', error)
      return NextResponse.json({ error: 'Failed to fetch vote' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        vote_type: vote?.vote_type || null,
        has_voted: !!vote
      }
    })

  } catch (error) {
    console.error('Error in get vote API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 更新投票数的辅助函数
async function updateVoteCounts(targetId: string, targetType: string, voteType: string, change: number) {
  const table = targetType === 'post' ? 'community_posts' : 'community_comments'
  const field = voteType === 'upvote' ? 'upvotes' : 'downvotes'

  // 使用 RPC 函数来原子性地更新计数
  const rpcFunction = `increment_${targetType}_${field}`
  
  await supabase.rpc(rpcFunction, {
    target_id: targetId,
    increment_by: change
  })
}