'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Download } from 'lucide-react';

export default function WhitepaperPage() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/whitepaper.pdf';
    link.download = 'PrimePick-Whitepaper.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary-dark">
      <Header />
      
      <main className="flex-1 py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              PrimePick Whitepaper
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-2">
              A Skill-Based, Transparent Crypto Raffle System
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Version 1.0 — Concept & Live Beta
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-primary-green text-primary-darker px-6 py-3 rounded-lg font-semibold hover:bg-primary-green/90 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-8 md:p-12 space-y-8">
              
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-primary-green mb-4">
                  1. Market and Opportunity
                </h2>
                <div className="text-gray-300 leading-relaxed space-y-4">
                  <p>
                    Digital raffles, lotteries, and prize competitions generate billions in global revenue every year. In crypto-native communities this behavior is even stronger, because users are already comfortable with wallets, tokens, and on-chain verification. However, the current crypto raffle and giveaway market is dominated by low-trust platforms. Users are asked to send funds into opaque systems with unverifiable randomness, changeable rules, and custodial risk. This has led to repeated failures, scams, and reputational damage across the category.
                  </p>
                  <p>
                    As a result, there is a large gap in the market for a raffle system that feels native to crypto's values: open, transparent, verifiable, and fair. Users want systems they can inspect, not ones they must blindly trust. They want rules that are fixed, outcomes that are provable, and platforms that do not depend on manipulation or psychological traps to function.
                  </p>
                  <p>
                    PrimePick exists to fill that gap. It is designed not as a casino, but as infrastructure for fair digital competitions.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-primary-green mb-4">
                  2. What PrimePick Is
                </h2>
                <div className="text-gray-300 leading-relaxed space-y-4">
                  <p>
                    PrimePick is a skill-based crypto raffle platform. Before entering any raffle, free or paid, users must pass a short crypto knowledge challenge. This ensures that participation is intentional, informed, and legally distinguishable from pure chance gambling. The skill requirement does not increase a user's chance of winning; it simply gates access.
                  </p>
                  <p>
                    Once verified, users can enter free raffles or paid raffles. Free access is always available on the platform. Each raffle has fixed parameters that cannot be changed once it goes live. Winners are selected fairly from the pool of eligible entries, and payouts are sent on-chain so anyone can verify them independently.
                  </p>
                  <p>
                    PrimePick is built on the idea that fairness should not be promised — it should be visible.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-primary-green mb-4">
                  3. Why Skill-Based Matters
                </h2>
                <div className="text-gray-300 leading-relaxed space-y-4">
                  <p>
                    Skill-based entry is not a cosmetic feature. It serves three critical purposes.
                  </p>
                  <p>
                    First, it improves legal defensibility by differentiating PrimePick from pure chance gambling models. In many jurisdictions, skill-based competitions and prize contests are treated differently from lotteries and betting.
                  </p>
                  <p>
                    Second, it improves user quality. Participants are more engaged, more informed, and less likely to behave abusively or impulsively.
                  </p>
                  <p>
                    Third, it creates educational value. Users learn simply by participating, and this learning becomes part of the platform's identity.
                  </p>
                  <p>
                    Skill does not replace chance. It simply ensures that chance operates inside a responsible, informed system.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-primary-green mb-4">
                  4. Product Evolution
                </h2>
                <div className="text-gray-300 leading-relaxed space-y-4">
                  <p>
                    PrimePick is built in stages.
                  </p>
                  <p>
                    The current version (v1) is a live beta. It uses a traditional web backend to manage raffles, verify skill completion, and execute payouts. Paid raffle funds are temporarily custodial, and randomness is not yet cryptographically provable. This version exists to validate the model, test behavior, and build operational credibility.
                  </p>
                  <p>
                    The next version (v2) removes the need for trust. Raffles move into audited smart contracts, funds become non-custodial, payouts are automated, and randomness is generated using verifiable on-chain sources such as Chainlink VRF. Skill verification becomes provable through cryptographic signatures or on-chain proofs. At this stage, PrimePick becomes trustless infrastructure rather than a trusted platform.
                  </p>
                  <p>
                    The long-term version (v3) opens PrimePick into a public protocol. Raffles become publicly discoverable, third parties can build on the data, and the system evolves from a single product into shared infrastructure for fair digital competitions.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-primary-green mb-4">
                  5. Business Model
                </h2>
                <div className="text-gray-300 leading-relaxed space-y-4">
                  <p>
                    PrimePick makes money only when value is created.
                  </p>
                  <p>
                    On paid raffles, the platform takes a small, transparent fee from the prize pool before payout. This fee is disclosed clearly before users enter. Free raffles are not monetized and are treated as community value and user acquisition.
                  </p>
                  <p>
                    As the system evolves, PrimePick can also generate revenue from infrastructure use by other projects, sponsorships of free raffles, and protocol-level fees embedded in smart contracts.
                  </p>
                  <p>
                    The platform does not profit from user losses, addiction, or confusion. It profits from volume, trust, and legitimate usage.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-primary-green mb-4">
                  6. Why PrimePick Wins
                </h2>
                <div className="text-gray-300 leading-relaxed space-y-4">
                  <p>
                    PrimePick wins because it aligns incentives cleanly.
                  </p>
                  <p>
                    Users get fairness, transparency, and real ownership.
                    <br />
                    Creators get a credible way to run competitions.
                    <br />
                    The platform grows only when trust grows.
                  </p>
                  <p>
                    This creates a rare dynamic in crypto: growth without deception.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-primary-green mb-4">
                  7. Vision
                </h2>
                <div className="text-gray-300 leading-relaxed space-y-4">
                  <p>
                    PrimePick is not trying to be the biggest raffle platform. It is trying to become the most trusted competition layer in crypto.
                  </p>
                  <p>
                    Long-term, PrimePick becomes neutral infrastructure — a standard for running fair, verifiable, skill-gated digital competitions across communities, brands, and educational platforms.
                  </p>
                  <p>
                    In a market defined by noise, hype, and manipulation, PrimePick chooses a different path: clarity, restraint, and structure.
                  </p>
                  <p>
                    Not because it is safer.
                  </p>
                  <p>
                    But because it is stronger.
                  </p>
                </div>
              </section>

              {/* Final Note */}
              <section className="pt-8 border-t border-primary-lightgray">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-green mb-4">
                  Final Note
                </h2>
                <div className="text-gray-300 leading-relaxed space-y-4">
                  <p>
                    PrimePick does not promise profit. It does not promise winning. It does not promise revolution.
                  </p>
                  <p>
                    It promises something simpler and rarer:
                  </p>
                  <p className="text-xl font-semibold text-primary-green">
                    A fair game, with visible rules, in a system that does not lie.
                  </p>
                  <p>
                    That is enough to build something that lasts.
                  </p>
                </div>
              </section>

            </div>

            {/* Download Button at Bottom */}
            <div className="text-center mt-12">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 bg-primary-green text-primary-darker px-6 py-3 rounded-lg font-semibold hover:bg-primary-green/90 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

