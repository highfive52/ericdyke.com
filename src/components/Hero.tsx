import './Hero.css'

export default function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero__inner">
        <h1 className="hero__headline">
          Building Scalable
          <br />
          <span className="hero__headline-accent">Data Systems</span>
        </h1>

        <p className="hero__body">
          I'm a Senior Data Engineer specializing in data modeling, pipeline
          orchestration, and cloud architecture—transforming raw data into
          reliable, analytics-ready platforms that power better
          decision-making.
        </p>

        <div className="hero__actions">
          <a href="#blog" className="btn btn--primary">
            View My Blog
          </a>
          <a href="#contact" className="btn btn--secondary">
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  )
}
