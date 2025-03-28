export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-100">
          <div className="max-w-3xl mx-auto py-8 px-4">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
