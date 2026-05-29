export const mockStats = {
  completionRate: 75,
  categoryStats: [
    { name: "개인", value: 12, color: "#6366f1" },
    { name: "업무", value: 25, color: "#f59e0b" },
    { name: "공부", value: 8, color: "#10b981" },
  ],
  weeklyTrend: [
    { day: "월", completed: 5 },
    { day: "화", completed: 8 },
    { day: "수", completed: 3 },
    { day: "목", completed: 7 },
    { day: "금", completed: 4 },
    { day: "토", completed: 2 },
    { day: "일", completed: 6 },
  ],
  monthlyTrend: Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}일`,
    completed: Math.floor(Math.random() * 10)
  }))
}
