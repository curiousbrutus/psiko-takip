import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

const availableTests = [
  {
    title: "Beck Depression Inventory (BDI-II)",
    description: "A 21-question multiple-choice self-report inventory, one of the most widely used psychometric tests for measuring the severity of depression.",
    href: "/dashboard/tests/beck-depression-inventory",
    Icon: BrainCircuit,
    enabled: true,
  },
  {
    title: "Young Schema Questionnaire (YSQ)",
    description: "Identifies Early Maladaptive Schemas, which are self-defeating emotional and cognitive patterns that begin early in our development.",
    href: "#",
    Icon: BrainCircuit,
    enabled: false,
  },
  {
    title: "MMPI Short Form",
    description: "A shorter version of the Minnesota Multiphasic Personality Inventory, a psychological test that assesses personality traits and psychopathology.",
    href: "#",
    Icon: BrainCircuit,
    enabled: false,
  },
];

export default function TestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Available Tests</h1>
        <p className="text-muted-foreground">
          Choose a test below to begin your self-assessment.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableTests.map((test) => (
          <Card key={test.title} className="flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <test.Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{test.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription>{test.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" disabled={!test.enabled}>
                <Link href={test.href}>
                  {test.enabled ? 'Start Test' : 'Coming Soon'} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
