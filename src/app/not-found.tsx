import Link from 'next/link'
import Button from '../../components/Button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">Not Found</h2>
      <p className="text-lg text-gray-600 mb-6">Could not find requested resource</p>
      <Link href="/" passHref>
        <Button>Return Home</Button>
      </Link>
    </div>
  )
}