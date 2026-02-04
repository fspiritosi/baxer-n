import { getInvitationByToken } from './actions.server';
import { _AcceptInvitationForm } from './components/_AcceptInvitationForm';

interface Props {
  token: string;
}

export async function AcceptInvitation({ token }: Props) {
  const invitation = await getInvitationByToken(token);

  return <_AcceptInvitationForm invitation={invitation} token={token} />;
}
