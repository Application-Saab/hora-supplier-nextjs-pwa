import Layout from "../../component/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout showBackButton={true}>
      <div style={styles.container}>
        <h1 style={styles.title}>Privacy Policy</h1>

        <p>
          This privacy policy sets out how <strong>HORA SERVICES</strong> uses
          and protects any information that you give HORA SERVICES when you
          visit their website and/or agree to purchase from them.
        </p>

        <p>
          HORA SERVICES is committed to ensuring that your privacy is protected.
          Should we ask you to provide certain information by which you can be
          identified when using this website, then you can be assured that it
          will only be used in accordance with this privacy statement.
        </p>

        <p>
          HORA SERVICES may change this policy from time to time by updating
          this page. You should check this page from time to time to ensure
          that you adhere to these changes.
        </p>

        <Section title="Information We May Collect">
          <ul>
            <li>Name</li>
            <li>Contact information including email address</li>
            <li>Demographic information such as postcode, preferences and interests (if required)</li>
            <li>Other information relevant to customer surveys and/or offers</li>
          </ul>
        </Section>

        <Section title="What We Do With The Information">
          <ul>
            <li>Internal record keeping</li>
            <li>Improve our products and services</li>
            <li>Send promotional emails about new products or offers</li>
            <li>Market research via email, phone, fax or mail</li>
            <li>Customize the website according to your interests</li>
          </ul>
        </Section>

        <Section title="Data Security">
          <p>
            We are committed to ensuring that your information is secure.
            In order to prevent unauthorised access or disclosure we have
            put suitable measures in place.
          </p>
        </Section>

        <Section title="How We Use Cookies">
          <p>
            A cookie is a small file placed on your device to help analyze
            web traffic and improve website experience.
          </p>
          <p>
            We use traffic log cookies to identify which pages are being used.
            This helps us analyze webpage traffic and improve our website.
          </p>
          <p>
            You can choose to accept or decline cookies through your browser
            settings.
          </p>
        </Section>

        <Section title="Controlling Your Personal Information">
          <p>
            You may choose to restrict the collection or use of your personal
            information by selecting the appropriate option on website forms.
          </p>
          <p>
            We will not sell, distribute or lease your personal information to
            third parties unless required by law or with your permission.
          </p>
        </Section>

        <Section title="Correction of Information">
          <p>
            If you believe any information we are holding on you is incorrect
            or incomplete, please write to:
          </p>

          <p style={{ marginTop: "10px" }}>
            <strong>HORA SERVICES</strong><br />
            B-27/295 Near Gidwani Park<br />
            Bhopal, Madhya Pradesh – 462030<br />
            India
          </p>
        </Section>

        <Section title="Contact & Support">
          <p>
            📧 Support Email: <strong>dev@horaservices.com</strong>
          </p>
          <p>
            🌐 Website: https://horaservices.com
          </p>
        </Section>
      </div>
    </Layout>
  );
};

const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h2 style={styles.sectionTitle}>{title}</h2>
    <div style={styles.content}>{children}</div>
  </div>
);

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.7",
    color: "#333",
  },
  title: {
    textAlign: "center",
    fontSize: "26px",
    marginBottom: "20px",
  },
  section: {
    marginTop: "25px",
    padding: "15px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: "18px",
    marginBottom: "10px",
    color: "#97538c",
  },
  content: {
    fontSize: "14px",
  },
};

export default PrivacyPolicy;