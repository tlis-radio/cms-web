'use client';
import { useRouter } from 'next/navigation'

const Home = () => {
  const router = useRouter()

  // Make sure we're in the browser
  if (typeof window !== 'undefined') {
    router.push('/pages/main')
  }
}

export default Home;