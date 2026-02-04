import { AcceptInvitation } from '@/modules/auth';

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function InvitePage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Token no proporcionado</h1>
          <p className="mt-2 text-muted-foreground">
            El enlace de invitación no es válido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AcceptInvitation token={token} />
    </div>
  );
}
