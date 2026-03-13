'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, Sparkles, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getChatResponseAction } from './actions';
import Link from 'next/link';

const CONSENT_KEY = 'psikotakip_ai_consent_v1';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConsentGiven, setIsConsentGiven] = useState(false);

  // Check localStorage on mount — only show consent once
  useEffect(() => {
    const stored = typeof window !== 'undefined'
      ? localStorage.getItem(CONSENT_KEY)
      : null;
    if (stored === 'true') setIsConsentGiven(true);
  }, []);

  const { user, userData } = useAuth();
  const router = useRouter();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the last 10 messages for context
      const history = messages.slice(-10);
      const result = await getChatResponseAction({ message: input, history });
      const modelMessage: Message = { role: 'model', content: result.response };

      if (result.isCrisis) {
        // Kriz durumunda kullanıcıyı yönlendir
        setTimeout(() => router.push('/emergency-support'), 2000);
      }

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'model',
        content: 'Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConsentGiven) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" /> Dijital Terapötik
              Asistan
            </CardTitle>
            <CardDescription>
              Başlamadan önce bilmeniz gerekenler.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Önemli Bilgilendirme ve Sınırlar</AlertTitle>
              <AlertDescription>
                Ben bir yapay zeka asistanıyım, gerçek bir terapist değilim.
                Sağladığım destek, profesyonel tıbbi tavsiye, teşhis veya
                tedavinin yerini tutmaz. Acil durumlar veya ciddi ruh sağlığı
                sorunları için lütfen profesyonel yardım alın.
              </AlertDescription>
            </Alert>
            <div className="p-4 border rounded-md text-sm text-muted-foreground space-y-2">
              <h3 className="font-semibold text-foreground">
                Veri Kullanımı ve Gizlilik Onayı
              </h3>
              <p>
                Bu sohbeti kullanarak, anonimleştirilmiş konuşma verilerinizin,
                size daha iyi ve bağlamsal destek sağlamak amacıyla yapay zeka
                tarafından işleneceğini kabul etmiş olursunuz.
              </p>
              <p>
                Lütfen sohbetlerinizde ad, e-posta, adres gibi tanımlanabilir
                kişisel bilgilerinizi paylaşmayınız. Gizliliğiniz bizim için
                önemlidir.
              </p>
              <p>
                Konuşmalarımızda kendine veya başkasına zarar verme gibi bir
                kriz durumu tespit edersem, sizi güvende tutmak amacıyla
                otomatik olarak acil durum kaynaklarına yönlendirmekle
                programlandım.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Vazgeç</Link>
            </Button>
            <Button onClick={() => {
              localStorage.setItem(CONSENT_KEY, 'true');
              setIsConsentGiven(true);
            }}>
              Anladım ve Kabul Ediyorum
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold font-headline">
          Dijital Terapötik Asistan
        </h1>
        <p className="text-sm text-muted-foreground">
          Bu bir yapay zeka sohbetidir. Gerçek bir terapistin yerini tutmaz.
        </p>
      </div>
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-22rem)] p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                  <p>Merhaba, size destek olmak için buradayım.</p>
                  <p>Bugün ne hakkında konuşmak istersiniz?</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Sparkles />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || ''} />
                      <AvatarFallback>
                        {userData?.displayName?.[0] || 'K'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Sparkles />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-muted flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Düşünüyorum...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <div className="flex w-full items-center space-x-2">
            <Textarea
              placeholder="Mesajınızı yazın..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 min-h-0 h-10 resize-none"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Gönder</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
