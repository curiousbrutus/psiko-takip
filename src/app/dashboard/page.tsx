import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Activity, FileText, Calendar } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back!</h1>
        <p className="text-muted-foreground">Here's a summary of your mental wellness journey.</p>
      </div>

      <Card className="bg-primary/10 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Ready for a new test?</CardTitle>
                <CardDescription>Start the Beck Depression Inventory to gain new insights.</CardDescription>
            </div>
            <Button asChild>
                <Link href="/dashboard/tests/beck-depression-inventory">
                    Start BDI-II Test <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">BDI-II Completed</div>
            <p className="text-xs text-muted-foreground">on June 28, 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Test Results</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 tests taken</div>
            <p className="text-xs text-muted-foreground">View all your past results</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">No appointments</div>
            <p className="text-xs text-muted-foreground">Sync with your therapist</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
