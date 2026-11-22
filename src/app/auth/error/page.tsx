import { BilingualText } from '@/components/layout/BilingualText';

export default function AuthErrorPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-lg font-semibold">
        <BilingualText
          english="Sign-in link expired or invalid"
          japanese="ログインリンクがきれているか、むこうです"
        />
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        <BilingualText
          english="Request a new sign-in link from the sign-in menu and try again."
          japanese="ログインメニューからあたらしいリンクをおくり、もういちどためしてください。"
        />
      </p>
    </div>
  );
}
