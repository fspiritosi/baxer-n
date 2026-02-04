import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import moment from 'moment';

interface InvitationEmailProps {
  inviteUrl: string;
  companyName: string;
  roleName: string;
  invitedByName: string;
  expiresAt: Date;
}

export function InvitationEmail({
  inviteUrl,
  companyName,
  roleName,
  invitedByName,
  expiresAt,
}: InvitationEmailProps) {
  const expiresFormatted = moment(expiresAt).format('DD/MM/YYYY');

  return (
    <Html>
      <Head />
      <Preview>Has sido invitado a unirte a {companyName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Invitación a {companyName}</Heading>

          <Text style={paragraph}>Hola,</Text>

          <Text style={paragraph}>
            <strong>{invitedByName}</strong> te ha invitado a unirte a{' '}
            <strong>{companyName}</strong> como <strong>{roleName}</strong>.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={inviteUrl}>
              Aceptar Invitación
            </Button>
          </Section>

          <Text style={paragraph}>
            O copia y pega este enlace en tu navegador:
          </Text>
          <Text style={link}>{inviteUrl}</Text>

          <Hr style={hr} />

          <Text style={footer}>
            Esta invitación expira el {expiresFormatted}. Si no solicitaste esta
            invitación, puedes ignorar este mensaje.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos inline para compatibilidad con clientes de email
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '8px',
};

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a1a1a',
  textAlign: 'center' as const,
  margin: '0 0 30px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
  margin: '0 0 20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#18181b',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const link = {
  fontSize: '14px',
  color: '#6b7280',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '30px 0',
};

const footer = {
  fontSize: '14px',
  color: '#9ca3af',
  margin: '0',
};

export default InvitationEmail;
