import React, { useEffect } from "react";

const About = () => {
  return (
    <div className="about-container">
      <div className="header">
        <h1 className="title">Cogni</h1>
        <div className="subtitle">Amplify Your Mind</div>
      </div>
      <div className="content">
        <p>
          Welcome to Cogni, where cutting-edge AI meets human potential. Our
          revolutionary platform is designed to elevate your cognitive
          abilities, transforming the way you think, learn, and create.
        </p>
      </div>
      <div className="features">
        <div className="feature-item">
          <div className="feature-icon">🧠</div>
          <h3>AI-Powered Assistance</h3>
          <p>
            Harness the power of advanced AI to boost your problem-solving
            skills and creative thinking.
          </p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🗺️</div>
          <h3>Mind Mapping</h3>
          <p>
            Visualize complex ideas with our intuitive and dynamic mind mapping
            tools.
          </p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">📊</div>
          <h3>Adaptive Learning</h3>
          <p>
            Experience personalized growth with our adaptive learning
            algorithms.
          </p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">👥</div>
          <h3>Collaborative Spaces</h3>
          <p>Connect and innovate in our virtual collaborative environments.</p>
        </div>
      </div>
      <div className="cta">
        <a href="#" className="cta-button">
          Start Your Journey
        </a>
      </div>

      <br />
      <br />
      <br />

      <div className="header">
        <h1 className="title">About Us</h1>
      </div>

      <div className="features">
        <div className="feature-item">
          <div className="feature-icon">💻</div>
          <h3>Syed Amanullah Wasti</h3>
          <p>
            Syed is a versatile full-stack developer with deep expertise in
            front-end development using React JS and back-end development with
            Spring Boot. His proficiency in database management with MySQL
            allows him to build robust and scalable applications. With a keen
            eye for detail and a commitment to excellence, Aman leads the
            development efforts to ensure that every project meets the highest
            standards.
          </p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🔍</div>
          <h3>Mirza Asfandyar Baig</h3>
          <p>
            Asfandyar is our SEO specialist, dedicated to ensuring that our
            projects achieve optimal visibility and performance on search
            engines. His skills in search engine optimization guarantee that our
            solutions are not only innovative but also easily discoverable by
            our target audience. Asfandyar’s strategic approach to SEO helps us
            reach and engage with users effectively.
          </p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🤖</div>
          <h3>Ahmed Bashaar</h3>
          <p>
            Ahmed is our data science guru, specializing in machine learning,
            data analysis, and AI integration. His expertise in harnessing data
            to uncover insights and drive decision-making helps us create
            intelligent, data-driven solutions. Ahmed’s work ensures that our
            projects not only meet functional requirements but also leverage the
            latest advancements in AI and machine learning.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

  .about-container {
    background-color: #0C0C0C;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 80px auto;
    overflow: hidden;
    position: relative;
  }

  .about-container::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(232, 72, 229, 0.1) 0%, rgba(82, 24, 250, 0.1) 100%);
    z-index: -1;
    animation: pulse 15s infinite, gradient 30s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @keyframes gradient {
    0% { background: radial-gradient(circle, rgba(232, 72, 229, 0.1) 0%, rgba(82, 24, 250, 0.1) 100%); }
    50% { background: radial-gradient(circle, rgba(82, 24, 250, 0.1) 0%, rgba(232, 72, 229, 0.1) 100%); }
    100% { background: radial-gradient(circle, rgba(232, 72, 229, 0.1) 0%, rgba(82, 24, 250, 0.1) 100%); }
  }

  .header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .title {
    font-optical-sizing: 2;
    font-family: "Poppins", sans-serif;
    font-weight: 600;
    font-style: normal;
    font-size: 5rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(45deg, #e848e5, #5218fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-transform: uppercase;
    letter-spacing: 5px;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }

  .subtitle {
    font-size: 1.5rem;
    color: #BDBDBD;
    font-weight: 300;
    letter-spacing: 2px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .content {
    font-size: 1.2rem;
    line-height: 1.8;
    margin-bottom: 4rem;
    text-align: center;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .feature-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 2rem;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .feature-item::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300%;
    height: 300%;
    background: radial-gradient(circle, rgba(82, 24, 250, 0.1) 0%, rgba(232, 72, 229, 0.1) 100%);
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    opacity: 0;
  }

  .feature-item:hover::before {
    opacity: 1;
  }

  .feature-item:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(82, 24, 250, 0.3);
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
  }

  .feature-item h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: #e848e5;
    z-index: 1;
  }

  .feature-item p {
    font-size: 1rem;
    color: #BDBDBD;
    z-index: 1;
  }

  .cta {
    text-align: center;
    margin-top: 4rem;
  }

  .cta-button {
    background: linear-gradient(45deg, #e848e5, #5218fa);
    color: #ffffff;
    padding: 1rem 2rem;
    border-radius: 30px;
    font-size: 1.2rem;
    font-weight: 600;
    text-transform: uppercase;
    text-decoration: none;
    transition: background 0.3s ease, transform 0.3s ease;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  .cta-button:hover {
    background: linear-gradient(45deg, #5218fa, #e848e5);
    transform: translateY(-5px);
  }

  .cta-button:active {
    transform: translateY(0);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  }
`;

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the page
  }, []);

  return (
    <>
      <style>{styles}</style>
      <About />
    </>
  );
};

export default AboutPage;
