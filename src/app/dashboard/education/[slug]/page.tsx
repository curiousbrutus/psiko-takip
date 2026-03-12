'use client';

import { useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { educationModules } from '@/lib/education-content';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// A simple renderer for the prototype to fake markdown
const ContentRenderer = ({ content }: { content: string }) => {
  return (
    <div className="space-y-4 text-foreground/90">
      {content.split('\n\n').map((paragraph, pIndex) => {
        const lines = paragraph.split('\n');
        return (
          <div key={pIndex}>
            {lines.map((line, lIndex) => {
              if (line.startsWith('## ')) {
                return (
                  <h2
                    key={lIndex}
                    className="text-2xl font-bold mt-6 pb-2 border-b"
                  >
                    {line.substring(3)}
                  </h2>
                );
              }
              if (line.startsWith('### ')) {
                return (
                  <h3 key={lIndex} className="text-xl font-semibold mt-4">
                    {line.substring(4)}
                  </h3>
                );
              }
              if (line.match(/^\d+\./)) {
                // Matches "1.", "2.", etc.
                return (
                  <p
                    key={lIndex}
                    className="pl-5 relative before:content-[attr(data-bullet)] before:absolute before:left-0"
                  >
                    {line}
                  </p>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <li key={lIndex} className="ml-5 list-disc">
                    {line.substring(2)}
                  </li>
                );
              }
              return (
                <p key={lIndex} className="leading-7">
                  {line}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default function EducationModulePage() {
  const [isCompleted, setIsCompleted] = useState(false);
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const educationModule = educationModules.find(m => m.slug === params.slug);

  if (!educationModule) {
    notFound();
  }

  const handleComplete = () => {
    setIsCompleted(true);
    // In a real app, you would save this state to Firestore
    // and show a toast notification using useToast().
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard/education')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Tüm Modüller
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">
            {educationModule.title}
          </CardTitle>
          <CardDescription>{educationModule.description}</CardDescription>
        </CardHeader>
        <Separator className="my-2" />
        <CardContent className="pt-6">
          <article>
            <ContentRenderer content={educationModule.content} />
          </article>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-4">
        <Button size="lg" onClick={handleComplete} disabled={isCompleted}>
          {isCompleted ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Modül Tamamlandı (+20 XP)
            </>
          ) : (
            'Okudum, Tamamlandı Olarak İşaretle'
          )}
        </Button>
      </div>
    </div>
  );
}
