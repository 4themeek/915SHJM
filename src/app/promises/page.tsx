import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './promises.module.css';

export const metadata: Metadata = {
  title: 'The 12 Promises of the Sacred Heart',
  description:
    'Jesus revealed the 12 Promises of the Sacred Heart to St. Margaret Mary Alacoque between 1673 and 1675. Discover each promise and how devotion to the Sacred Heart transforms hearts and homes.',
};

const PROMISES = [
  {
    number: 1,
    promise: 'I will give them all the graces necessary for their state in life.',
    reflection:
      'Jesus promises to provide every spiritual grace needed for our particular vocation and daily duties — whether as parent, priest, spouse, or servant.',
  },
  {
    number: 2,
    promise: 'I will establish peace in their families.',
    reflection:
      'Christ brings harmony, unity, and His own divine peace into the homes of those devoted to His Sacred Heart.',
  },
  {
    number: 3,
    promise: 'I will console them in all their troubles.',
    reflection:
      'In times of suffering, sorrow, and difficulty, Jesus offers the consolation and strength that only His Heart can give.',
  },
  {
    number: 4,
    promise: 'They shall find in My Heart an assured refuge during life and especially at the hour of death.',
    reflection:
      'The Sacred Heart is a place of safety and shelter — not only through the trials of life, but most especially at our final hour.',
  },
  {
    number: 5,
    promise: 'I will pour abundant blessings on all their undertakings.',
    reflection:
      'Those devoted to the Sacred Heart receive abundant divine blessing in their work, their families, and all their endeavors.',
  },
  {
    number: 6,
    promise: 'Sinners shall find in My Heart the source and infinite ocean of mercy.',
    reflection:
      'No matter how great one\'s sins, the mercy of the Sacred Heart is infinite. It is the source to which all sinners may turn with confidence.',
  },
  {
    number: 7,
    promise: 'Lukewarm souls shall become fervent.',
    reflection:
      'Those who are tepid or indifferent in their faith will be enkindled with new fervor through devotion to the Sacred Heart.',
  },
  {
    number: 8,
    promise: 'Fervent souls shall quickly mount to high perfection.',
    reflection:
      'Those already striving for holiness will be lifted to still greater heights of sanctity through this devotion.',
  },
  {
    number: 9,
    promise: 'I will bless every place in which an image of My Heart is exposed and honored.',
    reflection:
      'Every home, parish, school, or workplace that displays and honors an image of the Sacred Heart receives a special divine blessing. This is the heart of the Enthronement.',
  },
  {
    number: 10,
    promise: 'I will give to priests the gift of touching the most hardened hearts.',
    reflection:
      'Priests devoted to the Sacred Heart receive a special grace to reach even the most resistant and hardened souls.',
  },
  {
    number: 11,
    promise: 'Those who shall promote this devotion shall have their names written in My Heart, never to be blotted out.',
    reflection:
      'Those who spread devotion to the Sacred Heart — through word, example, or the sharing of sacred images — are held forever in the Heart of Jesus.',
  },
  {
    number: 12,
    promise:
      'I promise you in the excessive mercy of My Heart that My all-powerful love will grant to all those who receive Holy Communion on the First Fridays in nine consecutive months the grace of final perseverance; they shall not die in My disgrace, nor without receiving their sacraments. My divine Heart shall be their safe refuge in this last moment.',
    reflection:
      'Known as the Great Promise, this is the crowning gift of the devotion. Nine consecutive First Fridays — receiving Holy Communion in a state of grace — brings the assurance of final perseverance and a holy death.',
    isGreat: true,
  },
];

export default function PromisesPage() {
  return (
    <>
      <div className="page-hero">
        <h1>The 12 Promises of the Sacred Heart</h1>
        <p>Revealed by Our Lord to St. Margaret Mary Alacoque, 1673–1675</p>
      </div>

      {/* INTRO */}
      <div className="content-block" style={{ maxWidth: '860px' }}>
        <h2>A Revelation of Divine Love</h2>
        <p>
          Jesus Christ appeared to St. Margaret Mary Alacoque, a French Visitation nun, between 1673 and 1675.
          In a series of mystical visions, He revealed the depths of His love for mankind — a love symbolized
          by His Sacred Heart, aflame with charity, crowned with thorns, and wounded by a lance.
        </p>
        <p>
          Among the words He spoke to her, Our Lord made twelve extraordinary promises to all those who would
          honor His Sacred Heart and make an effort to return His love. St. Margaret Mary wrote them down, and
          they have been cherished by the Church ever since.
        </p>
        <p>
          As Fr. Karl Rahner wrote: <em>&ldquo;Taken in their entirety, these promises affirm and offer no more
          than Our Lord Himself promised in the Gospel to absolute Faith.&rdquo;</em> They are not magical
          guarantees, but graces that flow freely from sincere devotion to the Heart that loved us to the end.
        </p>

        <div className={styles.ornament}>
          <div className={styles.ornamentLine} />
          <span className={styles.ornamentCross}>✦ ✦ ✦</span>
          <div className={styles.ornamentLine} />
        </div>
      </div>

      {/* THE 12 PROMISES */}
      <section className={styles.promisesSection}>
        <div className={styles.promisesInner}>
          <h2 className={styles.promisesTitle}>The Twelve Promises</h2>
          <p className={styles.promisesSub}>As given by Our Lord Jesus Christ to St. Margaret Mary</p>

          <div className={styles.grid}>
            {PROMISES.map((p) => (
              <div key={p.number} className={`${styles.card} ${p.isGreat ? styles.great : ''}`}>
                <div className={styles.number}>
                  {p.isGreat ? '✦' : p.number}
                </div>
                {p.isGreat && (
                  <p className={styles.greatLabel}>The Great Promise</p>
                )}
                <p className={styles.promise}>&ldquo;{p.promise}&rdquo;</p>
                <p className={styles.reflection}>{p.reflection}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIRST FRIDAY DEVOTION */}
      <div className="content-block" style={{ maxWidth: '860px' }}>
        <h2>The First Friday Devotion</h2>
        <p>
          The Twelfth Promise — known as the Great Promise — is obtained through the First Friday Devotion:
          receiving Holy Communion on nine consecutive First Fridays of the month, offered in reparation
          for sins committed against the Sacred Heart of Jesus.
        </p>
        <p>
          Friday is significant as it recalls Good Friday, when Christ laid down His life for us. Those who
          take up this devotion are promised the grace of final perseverance — that they shall not die without
          receiving the sacraments, and that the Sacred Heart will be their refuge at the last hour.
        </p>

        <h2>Promise Nine &amp; the Enthronement</h2>
        <p>
          The Ninth Promise holds special significance for families: <em>&ldquo;I will bless every place in
          which an image of My Heart is exposed and honored.&rdquo;</em> This promise is the very foundation
          of the Enthronement of the Sacred Heart — the beautiful tradition of placing an image of the Sacred
          Heart in a place of honor in the home and consecrating the family to His reign.
        </p>
        <p>
          Our classic plaques display all 12 Promises alongside the image of the Sacred Heart, making them
          a constant reminder of these extraordinary gifts and an invitation to deeper devotion.
        </p>

        {/* CTA CARDS */}
        <div className={styles.ctaRow}>
          <div className={styles.ctaCard}>
            <p className={styles.ctaIcon}>✝</p>
            <h4>View Our Classic Plaques</h4>
            <p>Our most beloved plaques display all 12 Promises alongside the Sacred Heart image.</p>
            <Link href="/shop?cat=Plaques" className={styles.ctaBtn}>Shop Plaques</Link>
          </div>
          <div className={styles.ctaCard}>
            <p className={styles.ctaIcon}>✦</p>
            <h4>The Enthronement Booklet</h4>
            <p>A complete guide to enthroning the Sacred Heart in your home and family.</p>
            <Link href="/shop/27" className={styles.ctaBtn}>Get the Booklet</Link>
          </div>
          <div className={styles.ctaCard}>
            <p className={styles.ctaIcon}>♥</p>
            <h4>Questions?</h4>
            <p>We are happy to help you learn more about the devotion and find the right image.</p>
            <Link href="/contact" className={styles.ctaBtn}>Contact Us</Link>
          </div>
        </div>

        {/* QUOTE */}
        <div className={styles.quoteBlock}>
          <p className={styles.quoteText}>
            &ldquo;Behold this Heart which has so loved men that It has spared nothing, even to exhausting
            and consuming Itself, in order to testify to them Its love.&rdquo;
          </p>
          <p className={styles.quoteAttrib}>— Our Lord Jesus Christ to St. Margaret Mary Alacoque</p>
        </div>
      </div>
    </>
  );
}
