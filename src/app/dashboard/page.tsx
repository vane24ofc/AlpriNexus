import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, BookOpen, Users, Activity } from "lucide-react";
import Image from "next/image";

export default function DashboardHomePage() {
  // This could be dynamic based on user role
  const userName = "Demo User"; 
  const role = "Student"; // or 'Instructor', 'Admin'

  const quickLinks = [
    { title: "My Courses", href: "/dashboard/student/my-courses", icon: BookOpen, roles: ['student', 'instructor'] },
    { title: "User Management", href: "/dashboard/admin/users", icon: Users, roles: ['admin'] },
    { title: "View Progress", href: "/dashboard/student/progress", icon: BarChart, roles: ['student'] },
    { title: "Upload Resources", href: "/dashboard/resources", icon: Activity, roles: ['admin', 'instructor'] },
  ].filter(link => link.roles.includes(role.toLowerCase()));


  return (
    <div className="space-y-8">
      <Card className="bg-card/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold">Welcome back, {userName}!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            You are logged in as a {role}. Here&apos;s a quick overview of your AlpriNexus dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Explore your courses, manage content, or track progress. Use the sidebar to navigate through different sections of the platform.
          </p>
          {quickLinks.length > 0 && (
            <>
              <h3 className="text-xl font-semibold mb-3">Quick Links:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickLinks.map(link => (
                  <Button key={link.title} variant="outline" asChild className="justify-start p-6 text-left h-auto hover:bg-primary/10 hover:border-primary">
                    <a href={link.href}>
                      <link.icon className="mr-3 h-6 w-6 text-primary" />
                      <div>
                        <p className="font-semibold">{link.title}</p>
                        <p className="text-xs text-muted-foreground">Go to {link.title.toLowerCase()}</p>
                      </div>
                    </a>
                  </Button>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              +2 since last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +50 new enrollments this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">
              Average completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Featured Course</CardTitle>
            <CardDescription>Check out our latest featured course to enhance your skills.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:flex">
            <div className="md:w-1/2">
              <Image
                src="https://placehold.co/600x400.png"
                alt="Featured Course"
                width={600}
                height={400}
                className="object-cover w-full h-full"
                data-ai-hint="online course learning"
              />
            </div>
            <div className="p-6 md:w-1/2 flex flex-col justify-center">
              <h3 className="text-xl font-semibold mb-2">Advanced Web Development</h3>
              <p className="text-muted-foreground mb-4">
                Master modern web technologies including React, Node.js, and GraphQL. Build complex, scalable applications.
              </p>
              <Button asChild className="self-start">
                <Link href="#">Learn More</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

    </div>
  );
}
