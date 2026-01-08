const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create output directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a PDF document
const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 72, bottom: 72, left: 72, right: 72 }
});

// Pipe the PDF to a file
const outputPath = path.join(publicDir, 'whitepaper.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Whitepaper content
const content = {
  title: 'PrimePick Whitepaper',
  subtitle: 'A Skill-Based, Transparent Crypto Raffle System',
  version: 'Version 1.0 — Concept & Live Beta',
  sections: [
    {
      title: '1. Market and Opportunity',
      content: `Digital raffles, lotteries, and prize competitions generate billions in global revenue every year. In crypto-native communities this behavior is even stronger, because users are already comfortable with wallets, tokens, and on-chain verification. However, the current crypto raffle and giveaway market is dominated by low-trust platforms. Users are asked to send funds into opaque systems with unverifiable randomness, changeable rules, and custodial risk. This has led to repeated failures, scams, and reputational damage across the category.

As a result, there is a large gap in the market for a raffle system that feels native to crypto's values: open, transparent, verifiable, and fair. Users want systems they can inspect, not ones they must blindly trust. They want rules that are fixed, outcomes that are provable, and platforms that do not depend on manipulation or psychological traps to function.

PrimePick exists to fill that gap. It is designed not as a casino, but as infrastructure for fair digital competitions.`
    },
    {
      title: '2. What PrimePick Is',
      content: `PrimePick is a skill-based crypto raffle platform. Before entering any raffle, free or paid, users must pass a short crypto knowledge challenge. This ensures that participation is intentional, informed, and legally distinguishable from pure chance gambling. The skill requirement does not increase a user's chance of winning; it simply gates access.

Once verified, users can enter free raffles or paid raffles. Free access is always available on the platform. Each raffle has fixed parameters that cannot be changed once it goes live. Winners are selected fairly from the pool of eligible entries, and payouts are sent on-chain so anyone can verify them independently.

PrimePick is built on the idea that fairness should not be promised — it should be visible.`
    },
    {
      title: '3. Why Skill-Based Matters',
      content: `Skill-based entry is not a cosmetic feature. It serves three critical purposes.

First, it improves legal defensibility by differentiating PrimePick from pure chance gambling models. In many jurisdictions, skill-based competitions and prize contests are treated differently from lotteries and betting.

Second, it improves user quality. Participants are more engaged, more informed, and less likely to behave abusively or impulsively.

Third, it creates educational value. Users learn simply by participating, and this learning becomes part of the platform's identity.

Skill does not replace chance. It simply ensures that chance operates inside a responsible, informed system.`
    },
    {
      title: '4. Product Evolution',
      content: `PrimePick is built in stages.

The current version (v1) is a live beta. It uses a traditional web backend to manage raffles, verify skill completion, and execute payouts. Paid raffle funds are temporarily custodial, and randomness is not yet cryptographically provable. This version exists to validate the model, test behavior, and build operational credibility.

The next version (v2) removes the need for trust. Raffles move into audited smart contracts, funds become non-custodial, payouts are automated, and randomness is generated using verifiable on-chain sources such as Chainlink VRF. Skill verification becomes provable through cryptographic signatures or on-chain proofs. At this stage, PrimePick becomes trustless infrastructure rather than a trusted platform.

The long-term version (v3) opens PrimePick into a public protocol. Raffles become publicly discoverable, third parties can build on the data, and the system evolves from a single product into shared infrastructure for fair digital competitions.`
    },
    {
      title: '5. Business Model',
      content: `PrimePick makes money only when value is created.

On paid raffles, the platform takes a small, transparent fee from the prize pool before payout. This fee is disclosed clearly before users enter. Free raffles are not monetized and are treated as community value and user acquisition.

As the system evolves, PrimePick can also generate revenue from infrastructure use by other projects, sponsorships of free raffles, and protocol-level fees embedded in smart contracts.

The platform does not profit from user losses, addiction, or confusion. It profits from volume, trust, and legitimate usage.`
    },
    {
      title: '6. Why PrimePick Wins',
      content: `PrimePick wins because it aligns incentives cleanly.

Users get fairness, transparency, and real ownership.
Creators get a credible way to run competitions.
The platform grows only when trust grows.

This creates a rare dynamic in crypto: growth without deception.`
    },
    {
      title: '7. Vision',
      content: `PrimePick is not trying to be the biggest raffle platform. It is trying to become the most trusted competition layer in crypto.

Long-term, PrimePick becomes neutral infrastructure — a standard for running fair, verifiable, skill-gated digital competitions across communities, brands, and educational platforms.

In a market defined by noise, hype, and manipulation, PrimePick chooses a different path: clarity, restraint, and structure.

Not because it is safer.

But because it is stronger.`
    },
    {
      title: 'Final Note',
      content: `PrimePick does not promise profit. It does not promise winning. It does not promise revolution.

It promises something simpler and rarer:

A fair game, with visible rules, in a system that does not lie.

That is enough to build something that lasts.`
    }
  ]
};

// Helper function to add text with word wrapping
function addText(doc, text, options = {}) {
  const {
    fontSize = 11,
    lineSpacing = 1.2,
    color = 'black',
    bold = false,
    marginBottom = 12
  } = options;

  doc.fontSize(fontSize);
  doc.fillColor(color);
  if (bold) {
    doc.font('Helvetica-Bold');
  } else {
    doc.font('Helvetica');
  }

  const lines = doc.heightOfString(text, {
    width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
    align: 'left'
  });

  doc.text(text, {
    align: 'left',
    lineGap: (fontSize * lineSpacing) - fontSize
  });

  doc.moveDown(marginBottom / fontSize);
}

// Generate PDF
doc.font('Helvetica-Bold')
   .fontSize(24)
   .fillColor('#069852')
   .text(content.title, { align: 'center' });

doc.moveDown(0.5);

doc.font('Helvetica')
   .fontSize(14)
   .fillColor('#666666')
   .text(content.subtitle, { align: 'center' });

doc.moveDown(0.3);

doc.fontSize(10)
   .fillColor('#999999')
   .text(content.version, { align: 'center' });

doc.moveDown(2);

// Add sections
content.sections.forEach((section, index) => {
  // Section title
  doc.font('Helvetica-Bold')
     .fontSize(16)
     .fillColor('#069852')
     .text(section.title);
  
  doc.moveDown(0.8);

  // Section content
  doc.font('Helvetica')
     .fontSize(11)
     .fillColor('black')
     .text(section.content, {
       align: 'left',
       lineGap: 2
     });

  // Add space between sections (except last)
  if (index < content.sections.length - 1) {
    doc.moveDown(1.5);
  }
});

// Finalize the PDF
doc.end();

stream.on('finish', () => {
  console.log('✅ Whitepaper PDF generated successfully at:', outputPath);
});

stream.on('error', (err) => {
  console.error('❌ Error generating PDF:', err);
  process.exit(1);
});

