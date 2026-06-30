export default function Index() {
  return (
    <>
      <div className="grain-overlay" />

      <header className="header">
        <div className="logo">JASMIN</div>
        <nav>
          <a href="#menu">Меню</a>
          <a href="#about">О нас</a>
          <a href="#delivery">Доставка</a>
          <a href="#address">Адреса</a>
        </nav>
        <button className="btn-cta">Заказать</button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              СМЭШ-БУРГЕРЫ
              <br />
              И <span>ШАУРМА</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl mb-8 md:mb-10 leading-relaxed text-[#555]">
              Сочное мясо на гриле, свежие лепёшки и фирменные соусы. Уличная еда без компромиссов в дерзком вайбе 70-х.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              <button className="btn-cta" style={{ background: "var(--primary)", color: "white" }}>
                Заказать
              </button>
              <button className="btn-cta" style={{ background: "white" }}>
                Смотреть меню
              </button>
            </div>
          </div>
          <div className="hero-img">
            <div className="sticker">
              ГРИЛЬ
              <br />
              КАЖДЫЙ ДЕНЬ
            </div>
            <div className="floating-tag hidden md:block" style={{ top: "20%", left: "10%" }}>
              #СОЧНО
            </div>
            <div className="floating-tag hidden md:block" style={{ bottom: "30%", right: "20%" }}>
              ОГОНЬ
            </div>
          </div>
        </section>

        <div className="marquee">
          <div className="marquee-content">
            &nbsp; * СМЭШ-БУРГЕРЫ НА ГРИЛЕ * СОЧНАЯ ШАУРМА * ХРУСТЯЩИЙ КАРТОФЕЛЬ ФРИ * ОТКРЫТЫ ДО 2:00 * ЛУЧШИЕ В ГОРОДЕ *
            СМЭШ-БУРГЕРЫ НА ГРИЛЕ * СОЧНАЯ ШАУРМА * ХРУСТЯЩИЙ КАРТОФЕЛЬ ФРИ * ОТКРЫТЫ ДО 2:00 * ЛУЧШИЕ В ГОРОДЕ
          </div>
        </div>

        <section id="menu" className="section-padding">
          <div className="section-header">
            <h2 className="section-title">ВЫБОР ШЕФА</h2>
            <a
              href="#"
              className="text-sm md:text-base"
              style={{ color: "var(--dark)", fontWeight: 800, textTransform: "uppercase" }}
            >
              Всё меню
            </a>
          </div>

          <div className="menu-grid">
            {/* Item 1 */}
            <div className="menu-card">
              <img
                src="https://cdn.poehali.dev/projects/88664095-633f-4fa5-a32a-b3924974a3ff/files/4f14616e-5ba7-4796-9d15-20b1ca3da102.jpg"
                alt="Двойной смэш-бургер"
              />
              <div className="menu-card-body">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h3>Двойной Смэш</h3>
                  <span className="price">490 ₽</span>
                </div>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  Две сочные котлеты из говядины, расплавленный чеддер, фирменный соус и огурчики на булочке бриошь.
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="menu-card">
              <img
                src="https://cdn.poehali.dev/projects/88664095-633f-4fa5-a32a-b3924974a3ff/files/1d45ec2b-ea0c-47ec-b320-c39a83a6dd7f.jpg"
                alt="Шаурма с курицей"
              />
              <div className="menu-card-body">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h3>Шаурма Гриль</h3>
                  <span className="price">55 ₽ / 30 ₽</span>
                </div>
                <p style={{ fontSize: "14px", color: "#666" }}>Сочная курица на гриле, свежие овощи, фирменный острый соус в тонкой лепёшке. Большая — 55 ₽, мини — 30 ₽.</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="menu-card">
              <img
                src="https://cdn.poehali.dev/projects/88664095-633f-4fa5-a32a-b3924974a3ff/files/c961d287-1d66-43b4-9009-ae03c83bdd48.jpg"
                alt="Картофель фри"
              />
              <div className="menu-card-body">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h3>Фри по-нашему</h3>
                  <span className="price">190 ₽</span>
                </div>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  Хрустящий золотистый картофель фри с морской солью и соусом на выбор.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="retro-vibe">
          <div>
            <h2 className="vibe-title">ВКУС, КОТОРЫЙ ЦЕПЛЯЕТ.</h2>
            <p className="vibe-text">
              Мы не просто готовим — мы жарим на гриле до идеальной корочки. Свежее мясо, домашние соусы и булки каждый
              день. Залетай за добавкой или забирай с собой — будет огонь.
            </p>
            <button className="btn-cta" style={{ background: "var(--dark)", color: "white", borderColor: "white" }}>
              Наша история
            </button>
          </div>
          <div className="vibe-img"></div>
        </section>

        <section className="section-padding">
          <h2 className="section-title" style={{ marginBottom: "40px", textAlign: "center" }}>
            @JASMIN
          </h2>
          <div className="social-grid">
            <div className="social-item">
              <img
                src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Инста 1"
              />
            </div>
            <div className="social-item">
              <img
                src="https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Инста 2"
              />
            </div>
            <div className="social-item">
              <img
                src="https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Инста 3"
              />
            </div>
            <div className="social-item">
              <img
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Инста 4"
              />
            </div>
          </div>
        </section>
      </main>

      <footer id="address">
        <div>
          <div className="footer-logo">JASMIN</div>
          <p style={{ color: "#666", lineHeight: 1.6 }}>
            Сочные бургеры и шаурма на гриле. Готовим как для себя — быстро, вкусно и с дерзким вайбом 70-х.
          </p>
        </div>
        <div className="footer-links">
          <h4>Навигация</h4>
          <ul>
            <li>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
                Меню
              </a>
            </li>
            <li>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
                О нас
              </a>
            </li>
            <li>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
                Политика
              </a>
            </li>
            <li>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
                Условия
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Адрес</h4>
          <ul>
            <li>Рыбница</li>
            <li>ул. Мичурина, 35А/1</li>
          </ul>
        </div>
        <div className="footer-bottom">
          <span>2025 JASMIN</span>
          <span>ВКУС УЛИЦЫ</span>
          <span>IG / TW / TK</span>
        </div>
      </footer>
    </>
  );
}