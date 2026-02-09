# Valley Park - GitHub & Vercel Deploy

## 1. GitHub repo oluştur

1. **https://github.com/new** adresine git
2. Repository name: `valley-park`
3. **Public** seç
4. ❌ README, .gitignore, license **EKLEME** (boş repo oluştur)
5. **Create repository** tıkla

## 2. Push et

```powershell
cd "c:\Users\murat\.gemini\antigravity\scratch\valley-park"
git push -u origin master
```

(Repo oluşturduktan sonra bu komut çalışacak - credential'ların matchup'tan zaten kayıtlı)

## 3. Vercel deploy

1. **https://vercel.com** → Import Project
2. GitHub'dan `literallyeira/valley-park` repo'sunu seç
3. Framework: **Next.js** (otomatik algılanır)
4. Environment variables ekle (Supabase kullanıyorsan):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

---

**Not:** Repo zaten oluşturulduysa direkt `git push -u origin master` çalıştır.
