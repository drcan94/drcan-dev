export function Footer() {
  return (
    <footer className="mt-auto flex w-full justify-center border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 md:h-24 md:flex-row md:py-0">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Geliştiren:{" "}
          <a
            href="https://github.com/drcan94"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 hover:text-foreground"
          >
            Dr. Burak Can
          </a>
        </p>
        <p className="text-center text-sm text-muted-foreground md:text-right">
          &copy; {new Date().getFullYear()} DrCan.dev Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
