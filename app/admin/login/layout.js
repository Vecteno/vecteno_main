import '../../globals.css'

export default function AdminLoginLayout({ children }) {
  return (
    <div suppressHydrationWarning={true}>
      {children}
    </div>
  )
}
