import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, BookOpen, Settings, BarChart3, Bell } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Users", value: "1,523", icon: Users, trend: "+5% from last month" },
    { title: "Active Courses", value: "87", icon: BookOpen, trend: "+2 new this week" },
    { title: "System Health", value: "Optimal", icon: Settings, trend: "All systems operational" },
    { title: "Engagement Rate", value: "78%", icon: BarChart3, trend: "Up by 3% " },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Overview of recent platform activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { user: "Alice", action: "registered a new account.", time: "5m ago" },
                { user: "Bob (Instructor)", action: "published 'Advanced AI' course.", time: "1h ago" },
                { user: "Charlie", action: "completed 'Intro to Python'.", time: "2h ago" },
                { user: "System", action: "scheduled maintenance for tomorrow.", time: "4h ago" },
              ].map((activity, index) => (
                <li key={index} className="flex items-center space-x-3 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <span className="font-semibold">{activity.user}</span> {activity.action}
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">{activity.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <button className="p-4 border rounded-lg hover:bg-muted flex flex-col items-center text-center">
              <Users className="h-8 w-8 mb-2 text-primary"/>
              <span className="font-medium">Manage Users</span>
            </button>
            <button className="p-4 border rounded-lg hover:bg-muted flex flex-col items-center text-center">
              <BookOpen className="h-8 w-8 mb-2 text-primary"/>
              <span className="font-medium">Manage Courses</span>
            </button>
            <button className="p-4 border rounded-lg hover:bg-muted flex flex-col items-center text-center">
              <Bell className="h-8 w-8 mb-2 text-accent"/>
              <span className="font-medium">Send Announcement</span>
            </button>
            <button className="p-4 border rounded-lg hover:bg-muted flex flex-col items-center text-center">
              <Settings className="h-8 w-8 mb-2 text-muted-foreground"/>
              <span className="font-medium">System Settings</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
