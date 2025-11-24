import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nodal',
  icons: {
    icon: '/images/brand/nodal-logo.svg',
  },
}

export default function NodalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
