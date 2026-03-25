import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks';

export const HomePage = () => {
  return (
    <div className="relative min-h-screen text-white">
      <HeroSection />
      <HowItWorks />
    </div>
  )
}

export default HomePage;