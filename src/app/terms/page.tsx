'use client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useLanguage } from '@/hooks/useLanguage'

export default function TermsOfServicePage() {
  const { lang } = useLanguage()

  return (
    <>
      <Navbar />
      <main className="px-4 sm:px-6 py-16 sm:py-24 bg-bg-primary min-h-screen">
        <div className="max-w-3xl mx-auto prose prose-invert">
          {lang === 'sw' ? (
            <>
              <h1 className="text-[32px] font-bold text-text-primary mb-8">Masharti ya Huduma</h1>
              <p className="text-[14px] text-text-secondary mb-4">Ilisasishwa Mwisho: Julai 23, 2026</p>
              
              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">1. Kukubali Masharti</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Kwa kufikia na kutumia jukwaa la Maabara ya Mtandaoni ya Casuya, unakubali kufungwa na Masharti haya ya Huduma. Ikiwa hukubaliani, tafadhali usitumie jukwaa hili.
              </p>

              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">2. Matumizi ya Kielimu Pekee</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Majaribio yetu yanayofuata mitaala ya NECTA yanatolewa kwa madhumuni ya elimu pekee. Huruhusiwi kuhariri (reverse-engineer), kusambaza, au kujaribu kuchuma pesa kwa rasilimali zetu za maabara za 3D au API bila Leseni ya Kibiashara ya Msanidi Programu.
              </p>

              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">3. Usajili na Malipo</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Ufikiaji wa malipo (premium) unalipiwa kupitia AzamPesa. Malipo ya usajili hayarudishwi pindi mzunguko wa malipo unapoanza, isipokuwa kama inavyotakiwa na sheria ya mlaji ya Tanzania.
              </p>

              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">4. Mwenendo wa Mtumiaji</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Unakubali kutumia jukwaa hili kwa heshima. Unyanyasaji wowote wa mfumo wa maoni, vikomo vya API, au unyanyasaji wa watumiaji wengine utasababisha kusitishwa kwa akaunti yako mara moja.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[32px] font-bold text-text-primary mb-8">Terms of Service</h1>
              <p className="text-[14px] text-text-secondary mb-4">Last Updated: July 23, 2026</p>
              
              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                By accessing and using the Casuya Virtual Laboratory platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.
              </p>

              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">2. Educational Use Only</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Our NECTA-aligned simulations are provided for educational purposes only. You may not reverse-engineer, distribute, or attempt to monetize the 3D lab assets or API endpoints without a commercial Developer License.
              </p>

              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">3. Subscriptions and Payments</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Premium access is billed via AzamPesa. Subscriptions are non-refundable once a billing cycle has started, except as required by Tanzanian consumer law.
              </p>

              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">4. User Conduct</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                You agree to interact respectfully within the platform. Any abuse of the review system, API limits, or harassment of other users will result in immediate account termination.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
