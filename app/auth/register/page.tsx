// Regisztrációs oldal — Server Component
// Csak a layout és a searchParams kiolvasása, a form logika az AuthForm-ban van
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthForm } from '@/components/auth/auth-form'
import { FileText } from 'lucide-react'

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
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
            Hozz létre egy fiókot a kezdéshez
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Regisztráció</CardTitle>
            <CardDescription>
              Töltsd ki az alábbi mezőket a fiók létrehozásához.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm error={params.error} />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
