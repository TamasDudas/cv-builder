// Bejelentkezési oldal — Server Component
// Csak a layout és a searchParams kiolvasása, a form logika az AuthForm-ban van
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthForm } from '@/components/auth/auth-form'
import { FileText } from 'lucide-react'

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <FileText className="size-8 text-primary" />
            <span className="text-2xl font-bold">CV Builder</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Készítsd el önéletrajzodat percek alatt
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bejelentkezés</CardTitle>
            <CardDescription>
              Add meg az e-mail címed és jelszavad a belépéshez.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm error={params.error} message={params.message} />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
