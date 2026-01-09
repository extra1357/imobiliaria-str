// src/app/page.tsx
// Landing page simples sem API - Substitui a página inicial complexa

export default function Home() {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Imobiliária STR - Encontre seu Imóvel Ideal</title>
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 0; position: fixed; width: 100%; top: 0; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          nav { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }
          .logo { font-size: 1.8rem; font-weight: bold; }
          .nav-links { display: flex; gap: 2rem; list-style: none; }
          .nav-links a { color: white; text-decoration: none; transition: opacity 0.3s; }
          .nav-links a:hover { opacity: 0.8; }
          .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 150px 2rem 100px; text-align: center; }
          .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
          .hero p { font-size: 1.3rem; margin-bottom: 2rem; opacity: 0.9; }
          .cta-button { display: inline-block; background: white; color: #667eea; padding: 1rem 2.5rem; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 1.1rem; transition: transform 0.3s, box-shadow 0.3s; }
          .cta-button:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
          .features { max-width: 1200px; margin: 80px auto; padding: 0 2rem; }
          .features h2 { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #667eea; }
          .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
          .feature-card { background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); text-align: center; transition: transform 0.3s; }
          .feature-card:hover { transform: translateY(-10px); }
          .feature-icon { font-size: 3rem; margin-bottom: 1rem; }
          .feature-card h3 { color: #667eea; margin-bottom: 1rem; font-size: 1.5rem; }
          .contact { background: #f8f9fa; padding: 80px 2rem; text-align: center; }
          .contact h2 { font-size: 2.5rem; margin-bottom: 2rem; color: #667eea; }
          .contact-info { max-width: 600px; margin: 0 auto; }
          .contact-item { margin: 1.5rem 0; font-size: 1.2rem; }
          .contact-item a { color: #667eea; text-decoration: none; font-weight: bold; }
          footer { background: #333; color: white; text-align: center; padding: 2rem; }
          #admin-portal { display: none; position: fixed; bottom: 20px; right: 20px; background: #667eea; color: white; padding: 10px 20px; border-radius: 50px; text-decoration: none; font-weight: bold; box-shadow: 0 5px 15px rgba(0,0,0,0.3); animation: pulse 2s infinite; }
          #admin-portal.show { display: block; }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
          @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .hero p { font-size: 1rem; }
            .nav-links { gap: 1rem; }
          }
        ` }} />

        <header>
          <nav>
            <div className="logo">🏠 Imobiliária STR</div>
            <ul className="nav-links">
              <li><a href="#inicio">Início</a></li>
              <li><a href="#servicos">Serviços</a></li>
              <li><a href="#contato">Contato</a></li>
            </ul>
          </nav>
        </header>

        <section className="hero" id="inicio">
          <h1>Encontre o Imóvel dos Seus Sonhos</h1>
          <p>Casas, apartamentos e terrenos com as melhores condições</p>
          <a href="#contato" className="cta-button">Entre em Contato</a>
        </section>

        <section className="features" id="servicos">
          <h2>Nossos Serviços</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏡</div>
              <h3>Compra</h3>
              <p>Encontre o imóvel perfeito para você e sua família com nosso portfólio completo.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔑</div>
              <h3>Venda</h3>
              <p>Venda seu imóvel com rapidez e segurança através de nossa equipe especializada.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Aluguel</h3>
              <p>Encontre o imóvel ideal para alugar com as melhores condições do mercado.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Consultoria</h3>
              <p>Consultoria especializada para investimentos imobiliários.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Avaliação</h3>
              <p>Avaliação profissional do seu imóvel com base no mercado atual.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Atendimento</h3>
              <p>Atendimento personalizado do início ao fim da negociação.</p>
            </div>
          </div>
        </section>

        <section className="contact" id="contato">
          <h2>Entre em Contato</h2>
          <div className="contact-info">
            <div className="contact-item">
              📞 Telefone: <a href="tel:+5511999999999">(11) 99999-9999</a>
            </div>
            <div className="contact-item">
              📧 Email: <a href="mailto:contato@strsoftware.com.br">contato@strsoftware.com.br</a>
            </div>
            <div className="contact-item">
              📍 Endereço: Amparo, São Paulo, Brasil
            </div>
            <div className="contact-item" style={{ marginTop: '2rem' }}>
              <a href="#contato" className="cta-button">Agende uma Visita</a>
            </div>
          </div>
        </section>

        <footer>
          <p>&copy; 2025 Imobiliária STR. Todos os direitos reservados.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.7 }}>
            Desenvolvido por STR Software
          </p>
        </footer>

        <a href="/admin/login" id="admin-portal">🔐 Admin</a>

        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.altKey && e.key === 'r') {
              document.getElementById('admin-portal').classList.toggle('show');
            }
          });

          document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
              e.preventDefault();
              const target = document.querySelector(this.getAttribute('href'));
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            });
          });
        ` }} />
      </body>
    </html>
  );
}