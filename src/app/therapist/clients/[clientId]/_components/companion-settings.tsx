'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  apiGetCompanionConfig,
  apiSetCompanionConfig,
  apiGetCompanionFlags,
} from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sprout, Loader2, ShieldAlert, Save } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Flag {
  messageId: string;
  content: string;
  severity: string;
  reason: string;
  createdAt: string;
}

export default function CompanionSettings({ clientId }: { clientId: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [form, setForm] = useState({
    approach: '',
    tone: '',
    goals: '',
    forbiddenTopics: '',
    treatmentNotes: '',
    escalationSensitivity: 'medium',
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, fl] = await Promise.all([
        apiGetCompanionConfig(clientId),
        apiGetCompanionFlags(clientId),
      ]);
      if (cfg.success && cfg.data) {
        setForm({
          approach: cfg.data.approach || '',
          tone: cfg.data.tone || '',
          goals: cfg.data.goals || '',
          forbiddenTopics: cfg.data.forbiddenTopics || '',
          treatmentNotes: cfg.data.treatmentNotes || '',
          escalationSensitivity: cfg.data.escalationSensitivity || 'medium',
        });
      }
      if (fl.success) setFlags(fl.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await apiSetCompanionConfig(clientId, form);
      toast({
        title: res.success ? 'Kaydedildi' : 'Hata',
        description: res.success
          ? 'Yoldaş bu danışan için ayarlandı.'
          : 'Ayarlar kaydedilemedi.',
        variant: res.success ? 'default' : 'destructive',
      });
    } catch (e) {
      toast({
        title: 'Hata',
        description: 'Ayarlar kaydedilemedi.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flagged insights */}
      <Card className={flags.length ? 'border-destructive/40' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Yoldaş’ın İşaretledikleri
            {flags.length > 0 && (
              <Badge variant="destructive">{flags.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Danışanın Yoldaş’la sohbetinde dikkat gerektiren ifadeler. Karar her
            zaman sizindir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {flags.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Şu an işaretlenmiş bir sinyal yok.
            </p>
          ) : (
            <div className="space-y-2">
              {flags.map(f => (
                <div
                  key={f.messageId}
                  className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                >
                  <Badge
                    variant={f.severity === 'high' ? 'destructive' : 'secondary'}
                    className="shrink-0"
                  >
                    {f.severity === 'high' ? 'Yüksek' : 'Orta'}
                  </Badge>
                  <div className="text-sm">
                    <p className="italic">“{f.content}”</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {f.reason} ·{' '}
                      {f.createdAt &&
                        format(new Date(f.createdAt), 'd MMM HH:mm', {
                          locale: tr,
                        })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sprout className="h-5 w-5 text-primary" /> Yoldaş Ayarları
          </CardTitle>
          <CardDescription>
            Yoldaş, sizin yaklaşımınızı benimseyip danışanı seanslar arasında
            destekler — sizin yerinizi almadan, hep size yönlendirerek.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Terapi Yaklaşımı</Label>
              <Input
                value={form.approach}
                onChange={e => set('approach', e.target.value)}
                placeholder="Örn: Bilişsel Davranışçı Terapi (BDT)"
              />
            </div>
            <div className="space-y-2">
              <Label>Konuşma Tonu</Label>
              <Input
                value={form.tone}
                onChange={e => set('tone', e.target.value)}
                placeholder="Örn: şefkatli ve cesaretlendirici"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bu Danışan İçin Hedefler</Label>
            <Textarea
              value={form.goals}
              onChange={e => set('goals', e.target.value)}
              placeholder="Örn: Uyku düzenini iyileştirmek, kaçınma davranışını azaltmak"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Kaçınılacak Konular</Label>
            <Textarea
              value={form.forbiddenTopics}
              onChange={e => set('forbiddenTopics', e.target.value)}
              placeholder="Yoldaş’ın girmemesi gereken konular"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>
              Terapist Notları{' '}
              <span className="text-xs text-muted-foreground font-normal">
                (yalnızca Yoldaş’ın rehberi — danışana gösterilmez)
              </span>
            </Label>
            <Textarea
              value={form.treatmentNotes}
              onChange={e => set('treatmentNotes', e.target.value)}
              placeholder="Örn: Danışan sınav kaygısı yaşıyor; maruz bırakma ödevleri veriliyor."
              rows={3}
            />
          </div>
          <div className="space-y-2 max-w-xs">
            <Label>Eskalasyon Hassasiyeti</Label>
            <Select
              value={form.escalationSensitivity}
              onValueChange={v => set('escalationSensitivity', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Düşük</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Ayarları Kaydet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
