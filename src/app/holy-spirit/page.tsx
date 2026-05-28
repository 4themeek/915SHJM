import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import styles from './holy-spirit.module.css';

export const metadata: Metadata = {
  title: 'The Holy Spirit',
  description:
    "The gift and role of the Holy Spirit in God's plan of salvation — from Scripture and the saints to His intimate union with the Sacred Hearts of Jesus and Mary.",
};

const SCRIPTURE = [
  {
    ref: 'Luke 1:35',
    text: 'The Holy Spirit will come upon you, and the power of the Most High will overshadow you; therefore the child to be born will be called holy — the Son of God.',
    note: 'The Annunciation — the Holy Spirit effects the Incarnation in the womb of Mary.',
  },
  {
    ref: 'John 7:37–39',
    text: "Out of the believer's heart shall flow rivers of living water. Now He said this about the Spirit, which believers in Him were to receive.",
    note: 'The Holy Spirit flows from the pierced Heart of Christ to all who believe.',
  },
  {
    ref: 'John 14:16–17',
    text: 'I will ask the Father, and He will give you another Advocate, to be with you forever — the Spirit of Truth.',
    note: "Christ's promise of the Holy Spirit as Advocate and Sanctifier of souls.",
  },
  {
    ref: 'John 19:34',
    text: 'One of the soldiers pierced His side with a spear, and at once blood and water came out.',
    note: 'The Fathers of the Church see in this the outpouring of the Holy Spirit and the sacraments from the Sacred Heart.',
  },
  {
    ref: 'Acts 2:1–4',
    text: 'When the day of Pentecost had come, they were all together in one place. And suddenly from heaven there came a sound like the rush of a violent wind… All of them were filled with the Holy Spirit.',
    note: 'Mary was present in the Upper Room at Pentecost — the Spirit\'s descent completed what He had begun at the Annunciation.',
  },
  {
    ref: 'Romans 8:26',
    text: 'The Spirit helps us in our weakness; for we do not know how to pray as we ought, but that very Spirit intercedes with sighs too deep for words.',
    note: 'The Holy Spirit prays within us, drawing our hearts toward God.',
  },
  {
    ref: 'Galatians 5:22–23',
    text: 'The fruit of the Spirit is love, joy, peace, patience, kindness, generosity, faithfulness, gentleness, and self-control.',
    note: 'The fruits by which the Holy Spirit transforms the hearts of the faithful.',
  },
  {
    ref: 'Isaiah 11:2–3',
    text: 'The Spirit of the Lord shall rest on Him — the spirit of wisdom and understanding, the spirit of counsel and might, the spirit of knowledge and the fear of the Lord.',
    note: 'The sevenfold gifts of the Holy Spirit, foretold by Isaiah and given to all the baptized.',
  },
];

const SAINTS = [
  {
    name: 'St. Louis de Montfort',
    dates: 'd. 1716',
    role: 'Doctor of Marian Spirituality',
    quote: 'God the Holy Ghost, who does not produce any Divine Person, became fruitful through Mary whom He espoused. It is with her, in her, and through her that He produces His masterpiece — Jesus Christ.',
    context:
      "St. Louis de Montfort taught that the Holy Spirit works all His operations in souls through Mary. He saw Mary's Immaculate Heart as the instrument through which the Spirit sanctifies the world, writing: \"As it is through Mary that Jesus came to us the first time, it is through Mary that He will come the second time.\"",
  },
  {
    name: 'St. Maximilian Kolbe',
    dates: 'd. 1941',
    role: 'Martyr of Auschwitz, Apostle of the Immaculata',
    quote: 'The Third Person of the Blessed Trinity never took flesh; still, our human word "spouse" is far too weak to express the reality of the relationship between the Immaculata and the Holy Spirit. We can affirm that Mary is, in a sense, the quasi-incarnation of the Holy Spirit.',
    context:
      "St. Maximilian saw Mary as so perfectly united to the Holy Spirit that to venerate her is to venerate Him. He wrote: \"By venerating the Immaculata, we venerate in a very special way the Holy Spirit.\" For Kolbe, the Immaculate Conception was itself the supreme masterwork of the Holy Spirit — God's Love made visible in a human creature.",
  },
  {
    name: 'St. John Eudes',
    dates: 'd. 1681',
    role: 'Father of the Devotion to the Sacred Hearts',
    quote: "Jesus remained and will remain in Mary's heart forever — and through her heart He pours His Spirit upon the world.",
    context:
      'St. John Eudes understood the Hearts of Jesus and Mary as two flames of one fire — the Holy Spirit. He taught that the devotion to the Sacred Hearts is inseparable from openness to the Holy Spirit, whose love is the bond uniting the Divine Heart of the Son to the Immaculate Heart of His Mother.',
  },
  {
    name: 'St. Thomas Aquinas',
    dates: 'd. 1274',
    role: 'Doctor Angelicus',
    quote: "The gifts of the Holy Spirit are habits, instincts, and dispositions provided by God as supernatural helps — necessary for man's salvation, which he cannot achieve on his own.",
    context:
      "Aquinas taught that the seven gifts of the Holy Spirit perfect the virtues and elevate the soul beyond what unaided human reason can achieve. He saw the Holy Spirit as the soul's supreme interior teacher — the one who makes the heart capable of receiving and responding to the love of the Sacred Hearts.",
  },
  {
    name: 'St. Bonaventure',
    dates: 'd. 1274',
    role: 'Seraphic Doctor',
    quote: 'From the open side of Christ flows the river of life — the Holy Spirit given to those who believe, the same Spirit who fashioned His Heart in the womb of Mary.',
    context:
      'St. Bonaventure drew the deep connection between the pierced Heart of Christ on the Cross and the outpouring of the Holy Spirit. In his Mystical Vine he wrote of the Sacred Heart as the source from which the Spirit flows to all believers — a passage the Church uses in the Liturgy of the Hours for the Solemnity of the Sacred Heart.',
  },
  {
    name: 'Cardinal Robert Sarah',
    dates: 'Contemporary',
    role: 'Prefect Emeritus, Congregation for Divine Worship',
    quote: 'The Holy Spirit is the love between the Father and the Son made Person. He is the bond of the Trinity — and in coming to dwell in souls, He draws them into that same eternal exchange of love.',
    context:
      'Cardinal Sarah has emphasized that devotion to the Sacred Hearts is ultimately a Trinitarian devotion — the Father\'s love, expressed in the Son\'s pierced Heart, communicated through the Holy Spirit, received and magnified in the Immaculate Heart of Mary.',
  },
];

const GIFTS = [
  { gift: 'Wisdom', desc: "To see all things through God's eyes, to taste the sweetness of divine truth." },
  { gift: 'Understanding', desc: 'To penetrate the mysteries of faith with clarity and light.' },
  { gift: 'Counsel', desc: "To discern what is right and to guide others in God's ways." },
  { gift: 'Fortitude', desc: 'To bear trials and suffering with courage and perseverance.' },
  { gift: 'Knowledge', desc: 'To know created things in their relation to God.' },
  { gift: 'Piety', desc: 'To love God as a Father and to worship Him with devotion.' },
  { gift: 'Fear of the Lord', desc: 'To dread offending God — not from fear of punishment, but from love.' },
];

export default function HolySpiritPage() {
  return (
    <>
      {/* HERO — split layout with real Velázquez painting */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />

        {/* Real painting — left side */}
        <div className={styles.heroArt}>
          <div className={styles.paintingWrap}>
            <Image
              src="/images/coronation-of-mary.jpg"
              alt="The Coronation of the Virgin by Velázquez — God the Father and Jesus crown Mary while the Holy Spirit descends as a dove"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
              priority
            />
            <div className={styles.paintingOverlay} />
          </div>
          <p className={styles.paintingCredit}>
            Diego Velázquez · <em>The Coronation of the Virgin</em> · c. 1645 · Museo del Prado, Madrid
          </p>
        </div>

        {/* Text — right side */}
        <div className={styles.heroText}>
          <p className={styles.heroEyebrow}>✦ The Third Person of the Most Holy Trinity ✦</p>
          <h1 className={styles.heroTitle}>The Holy Spirit</h1>
          <p className={styles.heroSub}>
            The Bond of Love · The Sanctifier · The Soul of the Church
          </p>
          <p className={styles.heroDesc}>
            He overshadowed Mary at the Annunciation. He descended at Pentecost.
            He dwells in the hearts of the faithful. He is the love between the Father and the Son,
            made Person — and He is inseparable from the Sacred Hearts.
          </p>
        </div>
      </div>

      {/* INTRO */}
      <div className="content-block" style={{ maxWidth: '860px' }}>
        <h2>The Forgotten Person of the Trinity</h2>
        <p>
          Pope John Paul I once called the Holy Spirit the &ldquo;forgotten God&rdquo; — the Third Person
          of the Trinity whom Christians invoke but rarely contemplate. Yet He is present at every
          decisive moment of salvation history: hovering over the waters of creation, overshadowing
          the Virgin at the Annunciation, descending on the Son at His Baptism, pouring forth from
          the pierced Heart of Christ on the Cross, and filling the Upper Room at Pentecost with fire.
        </p>
        <p>
          To understand the Sacred Hearts of Jesus and Mary is to understand the Holy Spirit.
          For it was the Spirit who formed the Sacred Heart of Jesus in the womb of the Virgin.
          It was the Spirit who filled Mary&apos;s Immaculate Heart from the first moment of her
          conception. And it is the Spirit who works through both Hearts to draw every soul back
          to the Father.
        </p>

        <div className={styles.trinityBox}>
          <p className={styles.trinityLabel}>✦ The Holy Trinity &amp; the Sacred Hearts ✦</p>
          <div className={styles.trinityRow}>
            <div className={styles.trinityItem}>
              <span className={styles.trinityIcon}>☩</span>
              <p className={styles.trinityName}>God the Father</p>
              <p className={styles.trinityDesc}>The Source — who sends His Son and His Spirit for our salvation</p>
            </div>
            <div className={styles.trinityItem}>
              <span className={styles.trinityIcon}>♥</span>
              <p className={styles.trinityName}>God the Son</p>
              <p className={styles.trinityDesc}>The Sacred Heart — whose love for us is made visible and pierced</p>
            </div>
            <div className={styles.trinityItem}>
              <span className={styles.trinityIcon}>🕊</span>
              <p className={styles.trinityName}>God the Holy Spirit</p>
              <p className={styles.trinityDesc}>The Bond of Love — who unites the Hearts and sanctifies our souls</p>
            </div>
          </div>
        </div>
      </div>

      {/* SCRIPTURE */}
      <section className={styles.scriptureSection}>
        <div className={styles.scriptureInner}>
          <h2 className={styles.sectionTitle}>The Holy Spirit in Sacred Scripture</h2>
          <p className={styles.sectionSub}>From Genesis to Revelation, the Spirit breathes through every page</p>
          <div className={styles.scriptureGrid}>
            {SCRIPTURE.map((s, i) => (
              <div key={i} className={styles.scriptureCard}>
                <p className={styles.scriptureRef}>✦ {s.ref}</p>
                <p className={styles.scriptureText}>&ldquo;{s.text}&rdquo;</p>
                <p className={styles.scriptureNote}>{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOLY SPIRIT & MARY */}
      <div className="content-block" style={{ maxWidth: '860px' }}>
        <h2>The Holy Spirit &amp; the Immaculate Heart</h2>
        <p>
          The relationship between the Holy Spirit and Mary is the most intimate union between
          God and a human creature in all of history. The Church teaches that the Holy Spirit
          overshadowed her at the Annunciation, forming the Body of Christ in her womb. But the
          saints teach us something even more profound: the Spirit&apos;s union with Mary did not begin
          at the Annunciation. It began at her Immaculate Conception.
        </p>
        <p>
          From the very first moment of her existence, Mary was preserved from original sin and
          filled with the Holy Spirit — shaped by Him to be the perfect vessel of the Incarnate
          Word. St. Maximilian Kolbe called her the &ldquo;quasi-incarnation&rdquo; of the Holy Spirit:
          not divine, not the same as the hypostatic union in Christ, but so perfectly conformed
          to the Spirit that to see her is, in some sense, to see Him.
        </p>
        <p>
          And just as the Spirit formed Jesus in Mary&apos;s womb, He continues to form Jesus in the
          souls of the faithful — through her. As St. Louis de Montfort wrote: &ldquo;The Holy Spirit
          accomplishes everything in us through Mary.&rdquo;
        </p>

        <h2>The Holy Spirit &amp; the Sacred Heart</h2>
        <p>
          St. John, describing the piercing of Christ&apos;s side on the Cross, tells us that blood
          and water flowed from His Heart. The Fathers of the Church universally interpreted
          this as the outpouring of the Holy Spirit — the same Spirit whom Christ promised would
          flow like rivers of living water from the hearts of those who believe in Him
          (John 7:38–39).
        </p>
        <p>
          The Sacred Heart, then, is not only the symbol of Christ&apos;s love — it is the fountain
          from which the Holy Spirit flows into the world. Every grace, every sacrament, every
          conversion is the fruit of that pierced Heart, given through the Spirit. This is why
          St. Bonaventure wrote that the Sacred Heart is the source from which &ldquo;the river of
          life flows&rdquo; — the Holy Spirit given to all who believe.
        </p>
      </div>

      {/* SAINTS */}
      <section className={styles.saintsSection}>
        <div className={styles.saintsInner}>
          <h2 className={styles.sectionTitleLight}>The Saints on the Holy Spirit</h2>
          <p className={styles.sectionSubLight}>Eight centuries of theological witness</p>
          <div className={styles.saintsGrid}>
            {SAINTS.map((s, i) => (
              <div key={i} className={styles.saintCard}>
                <div className={styles.saintHeader}>
                  <div>
                    <h3 className={styles.saintName}>{s.name}</h3>
                    <p className={styles.saintRole}>{s.role} · {s.dates}</p>
                  </div>
                </div>
                <blockquote className={styles.saintQuote}>&ldquo;{s.quote}&rdquo;</blockquote>
                <p className={styles.saintContext}>{s.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEVEN GIFTS */}
      <div className="content-block" style={{ maxWidth: '860px' }}>
        <h2>The Seven Gifts of the Holy Spirit</h2>
        <p>
          Given at Baptism and strengthened at Confirmation, the seven gifts of the Holy Spirit
          are supernatural habits that perfect the soul&apos;s capacity to respond to God. St. Thomas
          Aquinas taught that they are necessary for salvation — that without them, the human
          soul cannot consistently follow the promptings of grace. They are the very means by which
          the Holy Spirit transforms a heart of stone into a heart on fire — conformed to the
          Sacred Heart of Jesus.
        </p>
        <div className={styles.giftsGrid}>
          {GIFTS.map((g, i) => (
            <div key={i} className={styles.giftCard}>
              <p className={styles.giftNum}>{i + 1}</p>
              <h4 className={styles.giftName}>{g.gift}</h4>
              <p className={styles.giftDesc}>{g.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '1.5rem' }}>
          These seven gifts correspond to the seven wounds of Christ — each gift a grace that
          flows from the pierced Heart through the Spirit to the soul that seeks union with God.
        </p>

        <h2>Pentecost — Mary &amp; the Birth of the Church</h2>
        <p>
          After the Ascension, the Apostles returned to Jerusalem and gathered in the Upper Room
          to pray. Scripture tells us that Mary, the Mother of Jesus, was with them. Ten days
          later, the Holy Spirit descended in tongues of fire — filling every soul present with
          power, courage, and the gifts necessary to proclaim the Gospel to the ends of the earth.
        </p>
        <p>
          Mary&apos;s presence at Pentecost is not incidental. She who had first received the Holy
          Spirit at the Annunciation was present at His great outpouring upon the Church. As the
          Spirit had once overshadowed her to form the physical Body of Christ, He now
          overshadowed the gathered disciples — with Mary in their midst — to form the Mystical
          Body of Christ, the Church.
        </p>

        <div className={styles.pentecostQuote}>
          <p className={styles.quoteText}>
            &ldquo;Come, Holy Spirit, fill the hearts of your faithful and enkindle in them the fire
            of Your love. Send forth Your Spirit and they shall be created, and You shall renew
            the face of the earth.&rdquo;
          </p>
          <p className={styles.quoteAttrib}>— Ancient Prayer of the Church</p>
        </div>

        <div className={styles.ctaRow}>
          <div className={styles.ctaCard}>
            <p className={styles.ctaIcon}>♥</p>
            <h4>The Sacred Heart</h4>
            <p>The fountain from which the Holy Spirit flows to the world.</p>
            <Link href="/shop?cat=Sacred+Heart+of+Jesus" className={styles.ctaBtn}>Shop Sacred Heart</Link>
          </div>
          <div className={styles.ctaCard}>
            <p className={styles.ctaIcon}>✦</p>
            <h4>Immaculate Heart</h4>
            <p>The human heart most perfectly conformed to the Holy Spirit.</p>
            <Link href="/immaculate-heart" className={styles.ctaBtn}>Learn More</Link>
          </div>
          <div className={styles.ctaCard}>
            <p className={styles.ctaIcon}>✝</p>
            <h4>The 12 Promises</h4>
            <p>Christ&apos;s promises to those devoted to His Sacred Heart.</p>
            <Link href="/promises" className={styles.ctaBtn}>Read the Promises</Link>
          </div>
        </div>

        <div className={styles.closingQuote}>
          <p className={styles.quoteText}>
            &ldquo;By venerating the Immaculata, we venerate in a very special way the Holy Spirit,
            whose spouse she is. Through her Immaculate Heart, the Spirit pours His love upon the
            world — drawing all souls to the Sacred Heart of Jesus, and through Him, to the Father.&rdquo;
          </p>
          <p className={styles.quoteAttrib}>— St. Maximilian Kolbe</p>
        </div>
      </div>
    </>
  );
}
