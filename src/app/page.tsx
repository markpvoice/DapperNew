export default function HomePage() {
  return (
    <div style={{ margin: 0, padding: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Navigation Header */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
        padding: '1rem 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#FFD700',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
          }}>
            Dapper Squad Entertainment
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#home" style={{ 
              color: 'white', 
              textDecoration: 'none',
              transition: 'color 0.3s ease'
            }}>Home</a>
            <a href="#services" style={{ color: 'white', textDecoration: 'none' }}>Services</a>
            <a href="#about" style={{ color: 'white', textDecoration: 'none' }}>About</a>
            <a href="#contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</a>
            <button style={{
              backgroundColor: '#FFD700',
              color: '#2C2C2C',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Get Quote
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #2C2C2C 50%, #1a1a1a 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Background Animation Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 3s ease-in-out infinite'
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>

        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '1000px',
          padding: '0 2rem',
          marginTop: '5rem'
        }}>
          {/* Main Hero Content */}
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            fontWeight: 'bold',
            marginBottom: '2rem',
            lineHeight: '1.1'
          }}>
            <span style={{
              background: 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(255, 215, 0, 0.3)'
            }}>
              Dapper Squad
            </span>
            <br />
            <span style={{
              color: 'white',
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: '300'
            }}>
              Entertainment
            </span>
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
            color: '#e0e0e0',
            marginBottom: '3rem',
            maxWidth: '800px',
            margin: '0 auto 3rem',
            lineHeight: '1.6'
          }}>
            Making every event <span style={{ color: '#FFD700', fontWeight: '600' }}>legendary</span> with professional DJ services, 
            photography, and unforgettable entertainment experiences across Chicago & Milwaukee.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            justifyContent: 'center',
            marginBottom: '4rem'
          }}>
            <button style={{
              backgroundColor: '#FFD700',
              color: '#2C2C2C',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(255, 215, 0, 0.3)',
              minWidth: '200px'
            }}>
              🎉 Book Your Event
            </button>
            <button style={{
              backgroundColor: 'transparent',
              color: '#FFD700',
              border: '2px solid #FFD700',
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '200px'
            }}>
              View Our Work
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem',
            marginTop: '4rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                color: '#FFD700', 
                marginBottom: '0.5rem',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
              }}>500+</div>
              <div style={{ color: '#e0e0e0', fontSize: '1.1rem' }}>Events Completed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                color: '#FFD700', 
                marginBottom: '0.5rem',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
              }}>5★</div>
              <div style={{ color: '#e0e0e0', fontSize: '1.1rem' }}>Average Rating</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                color: '#FFD700', 
                marginBottom: '0.5rem',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
              }}>10+</div>
              <div style={{ color: '#e0e0e0', fontSize: '1.1rem' }}>Years Experience</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'bounce 2s infinite'
        }}>
          <div style={{
            width: '24px',
            height: '40px',
            border: '2px solid #FFD700',
            borderRadius: '20px',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '8px'
          }}>
            <div style={{
              width: '4px',
              height: '12px',
              backgroundColor: '#FFD700',
              borderRadius: '2px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{
        padding: '5rem 0',
        backgroundColor: '#1a1a1a',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 'bold',
              marginBottom: '1.5rem'
            }}>
              Our <span style={{ color: '#FFD700' }}>Services</span>
            </h2>
            <p style={{
              fontSize: '1.3rem',
              color: '#e0e0e0',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              From intimate gatherings to grand celebrations, we bring the perfect soundtrack to your special moments.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* DJ Services */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🎵</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#FFD700', 
                marginBottom: '1rem' 
              }}>Professional DJ Services</h3>
              <p style={{ 
                color: '#e0e0e0', 
                marginBottom: '1.5rem', 
                lineHeight: '1.6' 
              }}>
                State-of-the-art sound systems, extensive music libraries, and seamless mixing for weddings, 
                corporate events, and private parties.
              </p>
              <ul style={{ 
                color: '#c0c0c0', 
                fontSize: '0.9rem',
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ marginBottom: '0.5rem' }}>• Premium sound equipment</li>
                <li style={{ marginBottom: '0.5rem' }}>• Unlimited music requests</li>
                <li style={{ marginBottom: '0.5rem' }}>• Professional lighting</li>
                <li style={{ marginBottom: '0.5rem' }}>• MC services included</li>
              </ul>
            </div>

            {/* Photography */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📸</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#FFD700', 
                marginBottom: '1rem' 
              }}>Event Photography</h3>
              <p style={{ 
                color: '#e0e0e0', 
                marginBottom: '1.5rem', 
                lineHeight: '1.6' 
              }}>
                Capture every precious moment with our professional photography services. 
                High-quality images delivered within 48 hours.
              </p>
              <ul style={{ 
                color: '#c0c0c0', 
                fontSize: '0.9rem',
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ marginBottom: '0.5rem' }}>• Professional equipment</li>
                <li style={{ marginBottom: '0.5rem' }}>• Same-day preview gallery</li>
                <li style={{ marginBottom: '0.5rem' }}>• Unlimited digital downloads</li>
                <li style={{ marginBottom: '0.5rem' }}>• Photo booth options</li>
              </ul>
            </div>

            {/* Karaoke */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🎤</div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#FFD700', 
                marginBottom: '1rem' 
              }}>Karaoke & Entertainment</h3>
              <p style={{ 
                color: '#e0e0e0', 
                marginBottom: '1.5rem', 
                lineHeight: '1.6' 
              }}>
                Interactive karaoke sessions with our extensive song library. 
                Perfect for breaking the ice and getting everyone involved.
              </p>
              <ul style={{ 
                color: '#c0c0c0', 
                fontSize: '0.9rem',
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ marginBottom: '0.5rem' }}>• 10,000+ song library</li>
                <li style={{ marginBottom: '0.5rem' }}>• Professional microphones</li>
                <li style={{ marginBottom: '0.5rem' }}>• Large display screens</li>
                <li style={{ marginBottom: '0.5rem' }}>• Interactive games</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section id="contact" style={{
        padding: '5rem 0',
        backgroundColor: '#000',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem'
          }}>
            Ready to Make Your Event <span style={{ color: '#FFD700' }}>Legendary?</span>
          </h2>
          <p style={{
            fontSize: '1.3rem',
            color: '#e0e0e0',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem'
          }}>
            Let's discuss your vision and create an unforgettable experience for you and your guests.
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            justifyContent: 'center',
            marginBottom: '3rem'
          }}>
            <button style={{
              backgroundColor: '#FFD700',
              color: '#2C2C2C',
              border: 'none',
              padding: '1rem 3rem',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '250px'
            }}>
              📞 Call (555) 123-4567
            </button>
            <button style={{
              backgroundColor: 'transparent',
              color: '#FFD700',
              border: '2px solid #FFD700',
              padding: '1rem 3rem',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '250px'
            }}>
              📧 Get Free Quote
            </button>
          </div>

          <div style={{ color: '#999' }}>
            <p style={{ marginBottom: '0.5rem' }}>📍 Serving Chicago, Milwaukee & Surrounding Areas</p>
            <p>✉️ info@dappersquad.com | 🌐 www.dappersquad.com</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#2C2C2C',
        padding: '2rem 0',
        borderTop: '1px solid rgba(255, 215, 0, 0.2)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ 
            color: '#FFD700', 
            fontWeight: 'bold', 
            fontSize: '1.2rem' 
          }}>
            Dapper Squad Entertainment
          </div>
          <div style={{ color: '#999', fontSize: '0.9rem' }}>
            © 2025 Dapper Squad Entertainment. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
