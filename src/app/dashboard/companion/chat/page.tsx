'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { apiCompanionChat, apiGetCompanionMessages } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Sprout, Loader2, ShieldAlert } from 'lucide-react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  flagged?: boolean;
}

export default function CompanionChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCrisis, setShowCrisis] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = () =>
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiGetCompanionMessages();
      if (res.success) {
        setMessages(
          (res.data || []).map((m: any) => ({
            role: m.role,
            content: m.content,
            flagged: m.flagged === 1 || m.flagged === true,
          }))
        );
        scrollToEnd();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setSending(true);
    scrollToEnd();
    try {
      const res = await apiCompanionChat(text);
      if (res.success) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: res.data.reply },
        ]);
        if (res.data.severity === 'high') setShowCrisis(true);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Şu an sana ulaşmakta küçük bir sorun yaşadım. Birazdan tekrar dener misin?',
        },
      ]);
    } finally {
      setSending(false);
      scrollToEnd();
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 pb-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/companion">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Sprout className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold leading-none">Yoldaşın</p>
            <p className="text-xs text-muted-foreground">
              Terapistinin yanında, senin için burada
            </p>
          </div>
        </div>
      </div>

      {showCrisis && (
        <Card className="mb-3 border-destructive/40 bg-destructive/5 p-3 flex gap-3">
          <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Yalnız değilsin.</p>
            <p className="text-muted-foreground">
              Zor bir andaysan lütfen terapistine ulaş; acil bir tehlike varsa{' '}
              <a href="tel:112" className="font-semibold text-destructive underline">
                112
              </a>
              ’yi ara ya da güvendiğin birini yanına çağır.
            </p>
          </div>
        </Card>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading ? (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sprout className="h-7 w-7 text-primary" />
            </div>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Merhaba! Aklından geçenleri benimle paylaşabilirsin. Seansların
              arasında buradayım — dinlemek için.
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Yoldaşın yazıyor…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2 pt-3 border-t mt-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Bugün nasıl hissediyorsun?"
          disabled={sending}
          className="flex-1"
        />
        <Button onClick={send} disabled={sending || !input.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
