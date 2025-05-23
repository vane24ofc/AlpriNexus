import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, PlusCircle, MessageSquare, BarChart } from "lucide-react";
import Link from "next/link";

export default function InstructorDashboardPage() {
  const stats = [
    { title: "My Courses", value: "12", icon: BookOpen, link: "#" },
    { title: "Total Students", value: "350", icon: Users, link: "#" },
    { title: "Pending Reviews", value: "8", icon: MessageSquare, link: "#" },
    { title: "Average Rating", value: "4.7/5", icon: BarChart, link: "#" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/dashboard/resources">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Course
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Button variant="link" size="sm" asChild className="px-0 -ml-1 text-primary">
                <Link href={stat.link}>View details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>My Active Courses</CardTitle>
            <CardDescription>Overview of your currently active courses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {[
                { id: "c1", name: "Advanced JavaScript", students: 120, progress: 75, lastUpdate: "2 days ago" },
                { id: "c2", name: "Data Structures in Python", students: 85, progress: 40, lastUpdate: "5 days ago" },
                { id: "c3", name: "Machine Learning Fundamentals", students: 145, progress: 60, lastUpdate: "Yesterday" },
              ].map((course) => (
                <li key={course.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{course.name}</h3>
                      <p className="text-sm text-muted-foreground">{course.students} students enrolled</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="#">Manage</Link>
                    </Button>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress: {course.progress}%</span>
                      <span>Last Update: {course.lastUpdate}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Student Feedback</CardTitle>
            <CardDescription>Latest comments and ratings from students.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { student: "Emily R.", course: "Advanced JS", comment: "Great course, very detailed!", rating: 5, time: "1h ago" },
                { student: "John B.", course: "Python DSA", comment: "Challenging but rewarding.", rating: 4, time: "3h ago" },
                { student: "Sarah K.", course: "ML Intro", comment: "Needs more examples in chapter 3.", rating: 3, time: "Yesterday" },
              ].map((feedback, index) => (
                <li key={index} className="text-sm border-b border-border pb-2 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{feedback.student} on <span className="text-primary">{feedback.course}</span></span>
                    <span className="text-xs text-muted-foreground">{feedback.time}</span>
                  </div>
                  <p className="text-muted-foreground mt-1">&quot;{feedback.comment}&quot;</p>
                  <div className="flex items-center mt-1">
                    {Array(5).fill(0).map((_, i) => (
                      <StarIcon key={i} className={`h-3 w-3 ${i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}
