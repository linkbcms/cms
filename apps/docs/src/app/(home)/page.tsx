import { Faq } from '@/app/(home)/components/faq';
import { Feature } from '@/app/(home)/components/feature';
import { Footer } from '@/app/(home)/components/footer';
import { Hero } from '@/app/(home)/components/hero';
import { Logos } from '@/app/(home)/components/logos';
import { Pricing } from '@/app/(home)/components/pricing';
import { Tools } from '@/app/(home)/components/tools';

export default function HomePage() {
  return (
    <main className="bg-[#0d0e11] text-[#0d0e11]">
      <Hero />
      <Feature />
      <Tools />
      <Logos />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  );
}
