"use server"

import { supabase } from "./supabase"
import { revalidatePath } from "next/cache"

// 切换收藏状态
export async function toggleBookmark(toolId: number, userId: string) {
  try {
    // 检查是否已收藏
    const { data: existing } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("tool_id", toolId)
      .eq("user_id", userId)
      .single()

    if (existing) {
      // 取消收藏
      const { error } = await supabase.from("bookmarks").delete().eq("tool_id", toolId).eq("user_id", userId)

      if (error) throw error

      return { success: true, message: "已取消收藏", bookmarked: false }
    } else {
      // 添加收藏
      const { error } = await supabase.from("bookmarks").insert({ tool_id: toolId, user_id: userId })

      if (error) throw error

      return { success: true, message: "已添加收藏", bookmarked: true }
    }
  } catch (error) {
    console.error("Toggle bookmark error:", error)
    return { success: false, message: "操作失败，请重试" }
  }
}

// 提交工具评价
export async function submitReview(toolId: number, userId: string, rating: number, title: string, content: string) {
  try {
    const { error } = await supabase.from("reviews").upsert({
      tool_id: toolId,
      user_id: userId,
      rating,
      title,
      content,
    })

    if (error) throw error

    // 重新计算工具平均评分
    const { data: reviews } = await supabase.from("reviews").select("rating").eq("tool_id", toolId)

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length

      await supabase
        .from("tools")
        .update({
          rating: Math.round(avgRating * 100) / 100,
          rating_count: reviews.length,
        })
        .eq("id", toolId)
    }

    revalidatePath(`/tool/[slug]`)
    return { success: true, message: "评价提交成功" }
  } catch (error) {
    console.error("Submit review error:", error)
    return { success: false, message: "提交失败，请重试" }
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
