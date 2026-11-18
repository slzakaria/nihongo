export default function AuthErrorPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-lg font-semibold">Sign-in link expired or invalid</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Request a new sign-in link from the sign-in menu and try again.
      </p>
    </div>
  )
}
