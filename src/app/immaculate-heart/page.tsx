import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './immaculate-heart.module.css';

export const metadata: Metadata = {
  title: 'The Immaculate Heart of Mary',
  description:
    'Discover the history of devotion to the Immaculate Heart of Mary — from medieval saints to the Church-approved apparitions of Fatima. Promises, revelations, and the Five First Saturdays.',
};

interface TimelineEntry {
  name: string;
  dates: string;
  content: string;
  isHighlight?: boolean;
}

interface TimelineEra {
  era: string;
  icon: string;
  title: string;
  isFatima?: boolean;
  entries: TimelineEntry[];
}

const TIMELINE: TimelineEra[] = [
  {
    era: '12th–13th Century',
    icon: '✦',
    title: 'The Medieval Saints',
    entries: [
      {
        name: 'St. Anselm of Canterbury & St. Bernard of Clairvaux',
        dates: 'c. 1080s–1100s',
        content:
          'The earliest clear expressions of devotion to the Heart of Mary appear in the pious meditations on the Ave Maria and Salve Regina attributed to these great doctors of the Church. St. Bernard in particular wrote of Mary\'s heart as the model of love for God.',
      },
      {
        name: 'St. Mechtilde of Hackeborn',
        dates: 'd. 1298',
        content:
          'In her Book of Special Grace, Our Lord revealed to St. Mechtilde the reasons to honor the Heart of Mary: for the ardent desires it conceived for the coming of Christ; for the love with which it burns; for its profound humility; for its tender love for the Infant Jesus; and for the care with which it treasured up His every word. Our Lady also appeared to St. Mechtilde and promised: "I will assist you at the hour of death," teaching her the Three Hail Marys as a special devotion.',
      },
      {
        name: 'St. Gertrude the Great',
        dates: 'd. 1302',
        content:
          'A close companion of St. Mechtilde at Helfta, St. Gertrude received many mystical encounters with both the Sacred Heart of Jesus and the Heart of Mary. She became one of the most ardent promoters of this devotion, writing of the Heart of Mary as a vessel of all grace and a refuge of souls.',
      },
      {
        name: 'St. Bridget of Sweden',
        dates: 'd. 1373',
        content:
          'In her celebrated Book of Revelations, Our Lady spoke to St. Bridget of the depths of her maternal suffering: "When He suffered, I felt as though my Heart endured the sufferings also… when My Son was scourged and torn with whips, my Heart was scourged and whipped with Him… His Heart was my heart… so that my beloved Son and myself redeemed the world as with one Heart."',
      },
    ],
  },
  {
    era: '15th–17th Century',
    icon: '✝',
    title: 'Doctors, Founders & the First Feast',
    entries: [
      {
        name: 'St. Bernardine of Siena',
        dates: 'd. 1444',
        content:
          'So absorbed was St. Bernardine in the contemplation of the Heart of Mary that he has been called the "Doctor of the Heart of Mary." The Church borrowed from his writings the lessons of the Second Nocturn for the liturgical feast of the Heart of Mary.',
      },
      {
        name: 'St. Francis de Sales',
        dates: 'd. 1622',
        content:
          'St. Francis de Sales wrote extensively of the perfections of the Heart of Mary as the supreme model of love for God. He dedicated his great work Theotimus to her Heart, describing it as the pattern of all true devotion.',
      },
      {
        name: 'St. John Eudes',
        dates: 'd. 1681',
        content:
          'Called by Pope Leo XIII the "Author of the Liturgical Worship of the Sacred Heart of Jesus and Holy Heart of Mary," St. John Eudes championed this devotion with extraordinary zeal. On May 8, 1648, he celebrated the first Church-approved liturgical feast of the Heart of Mary at Autun, France — a landmark moment in the history of this devotion. He wrote the great work Le Coeur Admirable and established religious societies dedicated to spreading this love throughout the Church.',
      },
    ],
  },
  {
    era: '17th–19th Century',
    icon: '♥',
    title: 'Growing Toward the Church',
    entries: [
      {
        name: 'St. Louis de Montfort',
        dates: 'd. 1716',
        content:
          'Through his True Devotion to Mary, St. Louis de Montfort taught that total consecration to Mary\'s Immaculate Heart is the surest path to Jesus. His writings profoundly shaped Marian spirituality and were a direct inspiration to St. John Paul II.',
      },
      {
        name: 'Pope Pius VII',
        dates: '1805',
        content:
          'Extending earlier permissions, Pope Pius VII allowed all religious societies and dioceses throughout the world to celebrate the feast of the Heart of Mary — a major step toward universal recognition.',
      },
      {
        name: 'Pope Pius IX — The Immaculate Conception',
        dates: '1854',
        content:
          'With the solemn definition of the Dogma of the Immaculate Conception, Pope Pius IX paved the way for the specific title of the Immaculate Heart. The defined truth that Mary was conceived without sin gave theological depth to the devotion to her Heart as a sinless vessel of divine love.',
      },
      {
        name: 'The Sacred Congregation of Rites',
        dates: '1855',
        content:
          'On July 21, 1855, the Sacred Congregation of Rites formally approved an Office and Mass in honor of the Most Pure Heart of Mary for the universal Roman Catholic Church — the fullest official recognition yet.',
      },
    ],
  },
  {
    era: '20th Century',
    icon: '★',
    title: 'Fatima & the Church-Approved Apparitions',
    isFatima: true,
    entries: [
      {
        name: 'Our Lady of Fatima — The Six Apparitions',
        dates: 'May–October 1917 · Fatima, Portugal · Church-Approved 1930',
        content:
          'Our Lady appeared six times to three shepherd children — Lucia dos Santos, Francisco, and Jacinta Marto — at the Cova da Iria in Fatima, Portugal. The apparitions were officially approved by the Bishop of Leiria in 1930 following extensive investigation. In the July apparition, Our Lady revealed: "God wishes to establish in the world devotion to My Immaculate Heart. If what I say to you is done, many souls will be saved and there will be peace." She showed the children a vision of Hell and warned: "If My requests are heeded, Russia will be converted, and there will be peace; if not, she will spread her errors throughout the world." The October 13 apparition concluded with the Miracle of the Sun, witnessed by approximately 70,000 people.',
        isHighlight: true,
      },
      {
        name: 'The Great Promise of Fatima',
        dates: 'July 13, 1917',
        content:
          '"In the end, My Immaculate Heart will triumph. The Holy Father will consecrate Russia to Me, she will be converted, and a period of peace will be granted to the world." This promise, given as part of the Great Secret of Fatima, remains the defining word of hope from the Immaculate Heart to the modern world.',
        isHighlight: true,
      },
      {
        name: 'The Five First Saturdays — Apparition to Sr. Lucia',
        dates: 'December 10, 1925 · Pontevedra, Spain',
        content:
          'Our Lady appeared to Sister Lucia — now a religious — holding out her Heart surrounded by sharp thorns. The Child Jesus said: "Have compassion on the Heart of your Most Holy Mother, covered with thorns, with which ungrateful men pierce it at every moment." Our Lady then promised: "I promise to assist at the hour of death, with all the graces necessary for salvation, all those who, on the first Saturday of five consecutive months, shall confess, receive Holy Communion, recite five decades of the Rosary, and keep me company for 15 minutes while meditating on the mysteries of the Rosary, with the intention of making reparation to my Immaculate Heart."',
        isHighlight: true,
      },
      {
        name: 'Our Lord Explains the Five Saturdays',
        dates: 'May 29–30, 1930',
        content:
          'Our Lord appeared to Sister Lucia and explained the five Saturdays correspond to the five types of offenses against the Immaculate Heart: blasphemies against her Immaculate Conception; against her Perpetual Virginity; against her Divine Maternity; offenses of those who instill indifference or hatred of her in children\'s hearts; and those who outrage her directly in her holy images.',
      },
      {
        name: 'Pope Pius XII — Consecration & Feast Day',
        dates: '1942–1944',
        content:
          'In the midst of World War II, Pope Pius XII consecrated the world to the Immaculate Heart of Mary on October 31, 1942. Two years later, in 1944, he extended the feast of the Immaculate Heart of Mary to the entire universal Church — establishing it as a memorial on the liturgical calendar for all Catholics.',
      },
      {
        name: 'St. Maximilian Kolbe',
        dates: 'd. 1941',
        content:
          'The martyr of Auschwitz wrote extensively of the Immaculata, teaching that total consecration to the Immaculate Heart is a path of spiritual transformation. He founded the Militia Immaculatae to spread this devotion worldwide.',
      },
      {
        name: 'St. John Paul II',
        dates: '1981–1984',
        content:
          'Shot on May 13 — the feast of Our Lady of Fatima — St. John Paul II attributed his survival to the Immaculate Heart. He later consecrated Russia and the world to the Immaculate Heart of Mary on March 25, 1984, fulfilling the request Our Lady had made at Fatima.',
      },
    ],
  },
];

const PROMISES = [
  {
    source: 'Our Lady at Fatima, July 1917',
    promise: 'God wishes to establish in the world devotion to My Immaculate Heart. If what I say to you is done, many souls will be saved and there will be peace.',
  },
  {
    source: 'Our Lady at Fatima, July 1917 — The Great Promise',
    promise: 'In the end, My Immaculate Heart will triumph. The Holy Father will consecrate Russia to Me, she will be converted, and a period of peace will be granted to the world.',
  },
  {
    source: 'Our Lady to Sr. Lucia, December 10, 1925',
    promise: 'I promise to assist at the hour of death, with all the graces necessary for salvation, all those who on the first Saturday of five consecutive months shall confess, receive Holy Communion, recite five decades of the Rosary, and keep me company for 15 minutes meditating on the mysteries of the Rosary with the intention of making reparation to my Immaculate Heart.',
  },
  {
    source: 'Our Lady to Sr. Lucia, 1917',
    promise: 'I promise salvation to those who embrace devotion to my Immaculate Heart.',
  },
  {
    source: 'Our Lady to St. Mechtilde, 13th Century',
    promise: 'I will assist you at the hour of death.',
  },
];

export default function ImmaculateHeartPage() {
  return (
    <>
      <div className="page-hero">
        <h1>The Immaculate Heart of Mary</h1>
        <p>Eight centuries of promises, revelations, and divine love</p>
      </div>

      {/* INTRO */}
      <div className="content-block" style={{ maxWidth: '860px' }}>
        <h2>A Heart Without Sin</h2>
        <p>
          The Immaculate Heart of Mary is the heart of a Mother — sinless, sorrowful, and burning
          with love for her Son and for every soul He redeemed. Crowned with thorns by the sins and
          ingratitude of men, yet ever merciful, it is the refuge Our Lord Himself has appointed for
          this age.
        </p>
        <p>
          Devotion to this Heart did not begin in the 20th century. It stretches back through eight
          centuries of saints, mystics, doctors, and popes — each adding their voice to the great
          chorus of those who found in Mary&apos;s Heart a path to Jesus. What the apparitions of Fatima
          accomplished was to bring this ancient devotion before the whole world, with urgency, with
          promises, and with a clear divine mandate.
        </p>
        <p>
          This page traces that history — from the medieval cloister to the fields of Portugal —
          and gathers the promises that Our Lady and Our Lord have made to those who honor her
          Immaculate Heart.
        </p>

        <div className={styles.ornament}>
          <div className={styles.ornamentLine} />
          <span className={styles.ornamentSymbol}>✦ ✦ ✦</span>
          <div className={styles.ornamentLine} />
        </div>
      </div>

      {/* PROMISES SUMMARY */}
      <section className={styles.promisesSection}>
        <div className={styles.promisesInner}>
          <h2 className={styles.promisesTitle}>Promises of the Immaculate Heart</h2>
          <p className={styles.promisesSub}>Given through approved apparitions and saintly revelations</p>
          <div className={styles.promisesGrid}>
            {PROMISES.map((p, i) => (
              <div key={i} className={styles.promiseCard}>
                <p className={styles.promiseSource}>✦ {p.source}</p>
                <p className={styles.promiseText}>&ldquo;{p.promise}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className={styles.timelineSection}>
        <div className={styles.timelineInner}>
          <h2 className={styles.timelineTitle}>Eight Centuries of Devotion</h2>
          <p className={styles.timelineSub}>The unbroken witness of the saints</p>

          {TIMELINE.map((era) => (
            <div key={era.era} className={`${styles.era} ${era.isFatima ? styles.fatimaEra : ''}`}>
              <div className={styles.eraHeader}>
                <span className={styles.eraIcon}>{era.icon}</span>
                <div>
                  <p className={styles.eraLabel}>{era.era}</p>
                  <h3 className={styles.eraTitle}>{era.title}</h3>
                </div>
              </div>
              <div className={styles.entries}>
                {era.entries.map((entry, i) => (
                  <div key={i} className={`${styles.entry} ${entry.isHighlight ? styles.highlight : ''}`}>
                    <div className={styles.entryHeader}>
                      <h4 className={styles.entryName}>{entry.name}</h4>
                      <span className={styles.entryDates}>{entry.dates}</span>
                    </div>
                    <p className={styles.entryContent}>{entry.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FIVE FIRST SATURDAYS */}
      <div className="content-block" style={{ maxWidth: '860px' }}>
        <h2>How to Honor the Immaculate Heart Today</h2>
        <p>
          Our Lady&apos;s requests are clear and within the reach of every soul. She asks for the daily
          Rosary, reparation for sins committed against her Heart, and devotion on the Five First
          Saturdays. These are not burdens but invitations — the open arms of a Mother drawing her
          children close.
        </p>

        <div className={styles.saturdaysBox}>
          <p className={styles.saturdaysTitle}>The Five First Saturdays Devotion</p>
          <p className={styles.saturdaysSubtitle}>As requested by Our Lady at Fatima, given to Sr. Lucia, 1925</p>
          <div className={styles.saturdaysList}>
            {[
              'Go to Confession (may be done within 8 days before or after)',
              'Receive Holy Communion',
              'Recite five decades of the Holy Rosary',
              'Keep Our Lady company for 15 minutes meditating on the mysteries of the Rosary',
              'Offer all with the intention of making reparation to the Immaculate Heart of Mary',
            ].map((step, i) => (
              <div key={i} className={styles.saturdayStep}>
                <span className={styles.saturdayNum}>{i + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
          <p className={styles.saturdaysPromise}>
            Our Lady&apos;s Promise: &ldquo;I promise to assist at the hour of death, with all the graces
            necessary for salvation, all those who on the first Saturday of five consecutive months
            fulfill these conditions.&rdquo;
          </p>
        </div>

        <h2>The Triumph of the Immaculate Heart</h2>
        <p>
          At Fatima, Our Lady gave the world its greatest word of hope: <em>&ldquo;In the end, My
          Immaculate Heart will triumph.&rdquo;</em> This promise — solemn, unconditional, and given
          by the Mother of God in a Church-approved apparition — stands as the anchor of Catholic
          hope in every dark hour.
        </p>
        <p>
          The triumph is not merely a future event. It begins in every heart that turns to her,
          in every home where her image is honored, in every Rosary prayed, in every First Saturday
          offered. Each act of devotion is a stone in the foundation of that final, certain victory.
        </p>

        {/* CTA */}
        <div className={styles.ctaRow}>
          <div className={styles.ctaCard}>
            <p className={styles.ctaIcon}>♥</p>
            <h4>Immaculate Heart Plaques</h4>
            <p>Honor her Heart in your home with our beautiful prints and plaques.</p>
            <Link href="/shop?cat=Immaculate+Heart+of+Mary" className={styles.ctaBtn}>
              Shop Images
            </Link>
          </div>
          <div className={styles.ctaCard}>
            <p className={styles.ctaIcon}>✦</p>
            <h4>The 12 Promises</h4>
            <p>Explore the Sacred Heart of Jesus and His 12 Promises to devoted souls.</p>
            <Link href="/promises" className={styles.ctaBtn}>
              Read the Promises
            </Link>
          </div>
          <div className={styles.ctaCard}>
            <p className={styles.ctaIcon}>✝</p>
            <h4>Enthronement Booklet</h4>
            <p>Consecrate your home to the Hearts of Jesus and Mary.</p>
            <Link href="/shop/27" className={styles.ctaBtn}>
              Get the Booklet
            </Link>
          </div>
        </div>

        <div className={styles.closingQuote}>
          <p className={styles.quoteText}>
            &ldquo;Our Lady told us that God wished to establish in the world devotion to her
            Immaculate Heart, and that whoever embraces this devotion can count on being saved.&rdquo;
          </p>
          <p className={styles.quoteAttrib}>— Servant of God Sister Lucia of Fatima</p>
        </div>
      </div>
    </>
  );
}
