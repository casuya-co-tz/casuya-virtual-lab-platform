'use client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useLanguage } from '@/hooks/useLanguage'

export default function PrivacyPolicyPage() {
  const { lang } = useLanguage()

  return (
    <>
      <Navbar />
      <main className="px-6 py-24 bg-bg-primary min-h-screen">
        <div className="max-w-3xl mx-auto prose prose-invert">
          {lang === 'sw' ? (
            <>
              <h1 className="text-[32px] font-bold text-text-primary mb-8">Sera ya Faragha</h1>
              <p className="text-[14px] text-text-secondary mb-4">Ilisasishwa Mwisho: Julai 23, 2026</p>
              
              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">1. Taarifa Tunazokusanya</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Casuya Technologies inakusanya taarifa chache sana za kibinafsi zinazohitajika ili kukupa uzoefu bora zaidi wa maabara ya mtandaoni. Hii inajumuisha jina lako, barua pepe, ushirika wako na shule, na data ya maendeleo ya maabara.
              </p>

              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">2. Jinsi Tunavyotumia Data Yako</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Data yako inatumika pekee kufuatilia maendeleo yako ya elimu, kusawazisha vipindi vyako vya maabara vya nje ya mtandao, na kutoa uchambuzi kwa wasimamizi wa shule yako iliyosajiliwa. Hatuiuizi data yako ya kibinafsi kwa watangazaji wa tatu.
              </p>

              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">3. Usalama wa Data & M-Pesa</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Usindikaji wa malipo unashughulikiwa kwa usalama kupitia M-Pesa. Casuya haihifadhi nenosiri lako (PIN) la pesa za mtandaoni au maelezo nyeti ya kifedha kwenye seva zetu. Trafiki yote imesimbwa kupitia HTTPS.
              </p>

              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">4. Haki Zako</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Chini ya miongozo ya ulinzi wa data ya Tanzania, una haki ya kuomba uuzaji kamili wa data yako ya elimu, au kuomba ufutaji kamili wa akaunti yako kutoka kwa Mipangilio yako ya Wasifu.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[32px] font-bold text-text-primary mb-8">Privacy Policy</h1>
              <p className="text-[14px] text-text-secondary mb-4">Last Updated: July 23, 2026</p>
              
              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">1. Information We Collect</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Casuya Technologies collects minimal personal information necessary to provide you with the best virtual laboratory experience. This includes your name, email address, school affiliation, and lab progress data.
              </p>

              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">2. How We Use Your Data</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Your data is used exclusively to track your educational progress, synchronize your offline lab sessions, and provide analytics to your registered school administrators. We do not sell your personal data to third-party advertisers.
              </p>

              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">3. Data Security & M-Pesa</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Payment processing is handled securely via M-Pesa. Casuya does not store your mobile money PINs or sensitive financial details on our servers. All traffic is encrypted via HTTPS.
              </p>

              <h2 className="text-[20px] font-bold text-text-primary mt-8 mb-4">4. Your Rights</h2>
              <p className="text-[16px] text-text-secondary leading-relaxed mb-4">
                Under Tanzanian data protection guidelines, you have the right to request a full export of your educational data, or request the complete deletion of your account from your Profile Settings.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
