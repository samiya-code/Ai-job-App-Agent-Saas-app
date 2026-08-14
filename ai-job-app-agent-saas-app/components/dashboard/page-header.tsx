type PageHeaderProps = {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="border-b bg-muted/20 px-8 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-2 text-base text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
