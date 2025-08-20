import Link from 'next/link';
import { educationModules } from '@/lib/education-content';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookText } from 'lucide-react';

export default function EducationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Psikoeğitim Modülleri
        </h1>
        <p className="text-muted-foreground">
          Ruh sağlığınızı güçlendirecek konular hakkında bilgi edinin.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {educationModules.map(module => (
          <Card key={module.slug} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg mt-1">
                  <BookText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{module.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription>{module.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/dashboard/education/${module.slug}`}>
                  Modülü Oku <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
